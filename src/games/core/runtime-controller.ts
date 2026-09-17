import type { BaseGameState, GameLifecycle, GameRuntime } from './contracts';
export interface GameHostError {
  phase: 'load' | 'mount' | 'runtime' | 'restart';
  cause: unknown;
}
interface ControllerOptions<TState extends BaseGameState> {
  parent: HTMLElement;
  loadRuntime: () => Promise<GameRuntime<TState>>;
  onState: (state: TState) => void;
  onReady: () => void;
  onError: (error: GameHostError) => void;
}
/** One effect owns one controller. No rendering library or React is required here. */
export function createRuntimeController<TState extends BaseGameState>(
  options: ControllerOptions<TState>,
) {
  let disposed = false;
  let failed = false;
  let runtime: GameLifecycle | null = null;
  const release = () => {
    const owned = runtime;
    runtime = null;
    owned?.destroy();
  };
  const fail = (phase: GameHostError['phase'], cause: unknown) => {
    if (disposed || failed) return;
    failed = true;
    try {
      release();
    } catch (cleanupCause) {
      if (process.env.NODE_ENV !== 'production')
        console.error('Game cleanup failed', cleanupCause);
    }
    options.onError({ phase, cause });
  };
  const ready = Promise.resolve().then(async () => {
    if (disposed) return;
    let phase: GameHostError['phase'] = 'load';
    try {
      const loaded = await options.loadRuntime();
      if (disposed) return;
      phase = 'mount';
      const mounted = loaded.mount({
        parent: options.parent,
        onState: (state) => {
          if (!disposed && !failed) options.onState(state);
        },
        onError: (cause) => fail('runtime', cause),
      });
      // Mount may synchronously report a fatal error or dispose the host.
      if (disposed || failed) {
        mounted.destroy();
        return;
      }
      runtime = mounted;
      options.onReady();
    } catch (cause) {
      fail(phase, cause);
    }
  });
  return {
    ready,
    restart() {
      if (!disposed && !failed) {
        try {
          runtime?.restart();
        } catch (cause) {
          fail('restart', cause);
        }
      }
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      try {
        release();
      } catch (cause) {
        if (process.env.NODE_ENV !== 'production')
          console.error('Game cleanup failed', cause);
      }
    },
  };
}
