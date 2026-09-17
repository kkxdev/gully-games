import * as Phaser from 'phaser';
import { ManagedPhaserGame } from '../core/managed-phaser';
import type {
  GameLifecycle,
  GameMountOptions,
} from '../core/contracts';
import type { PenFightPhase, PenFightState } from './types';
import {
  calculateFlick,
  completeRound,
  cpuFlick,
  initialMatch,
  roundOutcome,
  type Match,
  type Side,
} from './rules';

const DESK = { left: 55, right: 845, top: 55, bottom: 485 };
class PenFightScene extends Phaser.Scene {
  private pens!: Record<Side, Phaser.Physics.Matter.Sprite>;
  private aim!: Phaser.GameObjects.Graphics;
  private match: Match = initialMatch();
  private turn: Side = 'player';
  private phase: PenFightPhase = 'aiming';
  private dragging: number | null = null;
  private power = 0;
  private quietMs = 0;
  private movingMs = 0;
  private fallen = { player: false, cpu: false };
  private message = 'Your turn. Pull back on the blue pen.';
  constructor(private readonly report: GameMountOptions<PenFightState>['onState']) {
    super('pen-fight');
  }
  create() {
    const desk = this.add.graphics();
    desk.fillStyle(0x302a24).fillRect(0, 0, 900, 540);
    desk.fillStyle(0x61442c).fillRoundedRect(48, 56, 804, 442, 12);
    desk.fillStyle(0xbb8650).fillRoundedRect(55, 55, 790, 430, 8);
    for (let i = 0; i < 12; i++) {
      const y = 61 + i * 37;
      desk.lineStyle(2, 0x6d4326, 0.3).lineBetween(57, y, 843, y);
      for (let j = 0; j < 5; j++) {
        desk
          .lineStyle(1, 0xf8d29a, 0.2)
          .lineBetween(75 + j * 157, y + 12, 183 + j * 157, y + 16);
      }
    }
    desk.lineStyle(3, 0xf1c58e, 0.5).strokeRoundedRect(60, 60, 780, 420, 6);
    this.add
      .text(91, 87, 'VIII - B', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#6e482e',
      })
      .setAngle(-7);
    this.add
      .text(707, 445, '1994 ♡', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#6e482e',
      })
      .setAngle(4);
    for (const [key, color] of [
      ['blue', 0x245fbd],
      ['red', 0xbc4438],
    ] as const) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x000000, 0.18).fillRoundedRect(3, 9, 110, 13, 6);
      g.fillStyle(color).fillRoundedRect(2, 4, 97, 12, 5);
      g.fillStyle(0xf0d7a9).fillTriangle(98, 4, 114, 10, 98, 16);
      g.fillStyle(0x252c36).fillTriangle(108, 8, 117, 10, 108, 12);
      g.fillStyle(0xd7dce0).fillRoundedRect(15, 5, 32, 3, 1);
      g.lineStyle(1, 0xffffff, 0.4).lineBetween(50, 6, 94, 6);
      g.generateTexture(key, 120, 24);
      g.destroy();
    }
    this.pens = {
      player: this.matter.add.sprite(280, 350, 'blue'),
      cpu: this.matter.add.sprite(610, 205, 'red'),
    };
    for (const pen of Object.values(this.pens)) {
      pen
        .setRectangle(110, 13)
        .setFrictionAir(0.035)
        .setFriction(0.15)
        .setBounce(0.65)
        .setMass(1);
    }
    this.aim = this.add.graphics().setDepth(10);
    this.input.on('pointerdown', this.beginAim, this);
    this.input.on('pointermove', this.moveAim, this);
    this.input.on('pointerup', this.releaseAim, this);
    this.input.on('pointerupoutside', this.cancelAim, this);
    this.input.keyboard?.on('keydown-ESC', this.cancelAim, this);
    const cancel = () => this.cancelAim();
    const visibility = () => {
      if (document.hidden) this.cancelAim();
    };
    this.game.canvas.addEventListener('pointercancel', cancel);
    this.game.canvas.addEventListener('touchcancel', cancel, true);
    document.addEventListener('visibilitychange', visibility);
    const cleanup = () => {
      this.game.canvas.removeEventListener('pointercancel', cancel);
      this.game.canvas.removeEventListener('touchcancel', cancel, true);
      document.removeEventListener('visibilitychange', visibility);
      this.input.off('pointerdown', this.beginAim, this);
      this.input.off('pointermove', this.moveAim, this);
      this.input.off('pointerup', this.releaseAim, this);
      this.input.off('pointerupoutside', this.cancelAim, this);
      this.input.keyboard?.off('keydown-ESC', this.cancelAim, this);
      this.events.off('shutdown', cleanup);
      this.events.off('destroy', cleanup);
    };
    this.events.once('shutdown', cleanup);
    this.events.once('destroy', cleanup);
    this.resetRound();
  }
  private emit() {
    this.report({
      status: this.match.winner ? 'completed' : 'playing',
      scores: { ...this.match.scores },
      round: this.match.round,
      turn: this.turn,
      phase: this.phase,
      power: this.power,
      message: this.message,
      ...(this.match.winner
        ? {
            result: {
              winner: this.match.winner,
              scores: { ...this.match.scores },
            },
          }
        : {}),
    });
  }
  restartMatch() {
    this.time.removeAllEvents();
    this.match = initialMatch();
    this.resetRound();
  }
  private resetRound() {
    this.cancelAim();
    this.fallen = { player: false, cpu: false };
    for (const side of ['player', 'cpu'] as const) {
      const pen = this.pens[side];
      pen
        .setVisible(true)
        .setPosition(
          side === 'player' ? 280 : 610,
          side === 'player' ? 350 : 205,
        );
      pen
        .setVelocity(0, 0)
        .setAngularVelocity(0)
        .setAngle(side === 'player' ? -12 : 165);
    }
    this.turn = this.match.round % 2 ? 'player' : 'cpu';
    this.phase = 'aiming';
    this.message =
      this.turn === 'player'
        ? 'Your turn. Pull back on the blue pen.'
        : 'CPU opens this round. Watch the red pen…';
    this.emit();
    if (this.turn === 'cpu') this.scheduleCpu();
  }
  private beginAim(pointer: Phaser.Input.Pointer) {
    if (
      this.phase !== 'aiming' ||
      this.turn !== 'player' ||
      this.dragging !== null
    )
      return;
    const pen = this.pens.player;
    if (Phaser.Math.Distance.Between(pointer.x, pointer.y, pen.x, pen.y) > 76)
      return;
    this.dragging = pointer.id;
    this.moveAim(pointer);
  }
  private moveAim(pointer: Phaser.Input.Pointer) {
    if (pointer.id !== this.dragging) return;
    const pen = this.pens.player,
      flick = calculateFlick(pen, pointer);
    this.power = flick.power;
    this.aim.clear();
    const endX = pen.x + flick.x * flick.power * 155,
      endY = pen.y + flick.y * flick.power * 155;
    this.aim.lineStyle(4, 0xfff4bd, 0.9).lineBetween(pen.x, pen.y, endX, endY);
    this.aim.fillStyle(0xfff4bd).fillCircle(endX, endY, 6);
    this.aim.lineStyle(2, 0xfff4bd, 0.35).strokeCircle(pen.x, pen.y, 76);
    this.emit();
  }
  private releaseAim(pointer: Phaser.Input.Pointer) {
    if (pointer.id !== this.dragging) return;
    const flick = calculateFlick(this.pens.player, pointer);
    this.cancelAim();
    if (flick.power < 0.06) return;
    this.flick('player', flick);
  }
  private cancelAim() {
    this.dragging = null;
    this.power = 0;
    this.aim?.clear();
    if (this.pens) this.emit();
  }
  private flick(side: Side, flick: ReturnType<typeof calculateFlick>) {
    this.pens[side].setVelocity(
      flick.x * flick.power * 19,
      flick.y * flick.power * 19,
    );
    this.phase = 'moving';
    this.quietMs = 0;
    this.movingMs = 0;
    this.message =
      side === 'player'
        ? 'Nice flick! Let the pens settle…'
        : 'CPU flicked. Let the pens settle…';
    this.emit();
  }
  private scheduleCpu() {
    this.time.delayedCall(850, () => {
      if (this.phase === 'aiming' && this.turn === 'cpu')
        this.flick('cpu', cpuFlick(this.pens.cpu, this.pens.player));
    });
  }
  update(_time: number, delta: number) {
    if (this.phase !== 'moving') return;
    this.movingMs += delta;
    let quiet = true;
    for (const side of ['player', 'cpu'] as const) {
      const pen = this.pens[side];
      // A pen falls when its centre passes the desk edge. Fallen pens cannot return.
      if (
        !this.fallen[side] &&
        (pen.x < DESK.left ||
          pen.x > DESK.right ||
          pen.y < DESK.top ||
          pen.y > DESK.bottom)
      ) {
        this.fallen[side] = true;
        pen
          .setVisible(false)
          .setPosition(side === 'player' ? -1000 : -1300, -1000)
          .setVelocity(0, 0)
          .setAngularVelocity(0);
      }
      const body = pen.body as MatterJS.BodyType;
      if (
        !this.fallen[side] &&
        (body.speed > 0.12 || Math.abs(body.angularVelocity) > 0.008)
      )
        quiet = false;
    }
    this.quietMs = quiet ? this.quietMs + delta : 0;
    if (this.quietMs < 450 && this.movingMs < 12000) return;
    for (const pen of Object.values(this.pens))
      pen.setVelocity(0, 0).setAngularVelocity(0);
    const outcome = roundOutcome(this.fallen.player, this.fallen.cpu);
    if (outcome) {
      const finishedRound = this.match.round;
      this.match = completeRound(this.match, outcome);
      this.phase = this.match.winner ? 'match-over' : 'round-over';
      this.message = this.match.winner
        ? `${this.match.winner === 'player' ? 'You win' : 'CPU wins'} the match! Restart for a rematch.`
        : outcome === 'draw'
          ? 'Both pens fell! Draw — replaying this round.'
          : `${outcome === 'player' ? 'You win' : 'CPU wins'} round ${finishedRound}! Next round…`;
      this.emit();
      if (!this.match.winner)
        this.time.delayedCall(1800, () => this.resetRound());
    } else {
      this.turn = this.turn === 'player' ? 'cpu' : 'player';
      this.phase = 'aiming';
      this.message =
        this.turn === 'player'
          ? 'Your turn. Pull back on the blue pen.'
          : 'CPU is lining up a flick…';
      this.emit();
      if (this.turn === 'cpu') this.scheduleCpu();
    }
  }
}
export function mount({ parent, onState }: GameMountOptions<PenFightState>): GameLifecycle {
  const scene = new PenFightScene(onState);
  const game = new ManagedPhaserGame({
    type: Phaser.AUTO,
    parent,
    width: 900,
    height: 540,
    backgroundColor: '#302a24',
    scene,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: {
      default: 'matter',
      matter: { gravity: { x: 0, y: 0 }, enableSleeping: false },
    },
    input: { activePointers: 2 },
    render: { antialias: true },
    audio: { noAudio: true },
  });
  const resize = new ResizeObserver(() => game.scale.refresh());
  resize.observe(parent);
  let destroyed = false;
  return {
    restart: () => {
      if (!destroyed && scene.sys.isActive()) scene.restartMatch();
    },
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      resize.disconnect();
      game.destroy(true);
    },
  };
}
