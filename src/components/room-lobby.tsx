'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import {
  isRoomCode,
  normalizeRoomCode,
} from '@/games/pen-fight/realtime/room-code';
import { validateNickname } from '@/lib/guest-profile';
import { trackEvent } from '@/lib/analytics';

type View = 'join' | 'waiting';

export function RoomLobby({ rawCode }: { rawCode: string }) {
  const code = normalizeRoomCode(rawCode);
  const valid = isRoomCode(code);
  const [seat, setSeat] = useState<'host' | 'guest' | null>(null);
  const [view, setView] = useState<View>('join');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!valid) return;
    queueMicrotask(() => {
      const storedSeat = sessionStorage.getItem(
        `gully-games.room.${code}.seat`,
      );
      if (storedSeat === 'host' || storedSeat === 'guest') {
        setSeat(storedSeat);
        setView('waiting');
      }
      setNickname(localStorage.getItem('gully-games.guest-nickname') ?? '');
    });
  }, [code, valid]);

  if (!valid)
    return (
      <Recovery
        title="This room code got lost between classes."
        body="Check the link, or start a fresh challenge."
      />
    );

  function join(event: FormEvent) {
    event.preventDefault();
    const result = validateNickname(nickname);
    if (!result.ok) return setError(result.message);
    localStorage.setItem('gully-games.guest-nickname', result.nickname);
    sessionStorage.setItem(`gully-games.room.${code}.seat`, 'guest');
    sessionStorage.setItem(
      `gully-games.room.${code}.token`,
      crypto.randomUUID(),
    );
    setSeat('guest');
    setView('waiting');
    trackEvent('room_joined', { game_id: 'pen-fight' });
  }

  async function share() {
    const url = window.location.href;
    const data = {
      title: 'One more Pen Fight?',
      text: `Lunch break, 1994. Room ${code}. Settle this on the desk.`,
      url,
    };
    const nativeShare = (
      navigator as Navigator & {
        share?: (data: ShareData) => Promise<void>;
      }
    ).share;
    let method: 'native' | 'clipboard';
    if (nativeShare) {
      await nativeShare.call(navigator, data);
      method = 'native';
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      method = 'clipboard';
    }
    trackEvent('challenge_shared', {
      game_id: 'pen-fight',
      method,
    });
  }

  if (view === 'join')
    return (
      <section className="room-card">
        <p className="eyebrow">PEN FIGHT · ROOM {code}</p>
        <h1>Someone saved you a seat.</h1>
        <p>First to three. No excuses after the bell.</p>
        <form className="challenge-form" onSubmit={join} noValidate>
          <label htmlFor="join-nickname">Your nickname</label>
          <div className="nickname-row">
            <input
              id="join-nickname"
              value={nickname}
              onChange={(event) => {
                setNickname(event.target.value);
                setError('');
              }}
            />
            <button className="primary-action" type="submit">
              Join the desk
            </button>
          </div>
          <span className="form-error" role="alert">
            {error}
          </span>
        </form>
      </section>
    );

  return (
    <section className="room-card waiting-card">
      <p className="eyebrow">
        ROOM {code} · {seat === 'host' ? 'YOUR CHALLENGE' : 'YOU JOINED'}
      </p>
      <h1>
        {seat === 'host'
          ? 'Waiting by the desk.'
          : 'Both players are nearly ready.'}
      </h1>
      <div className="room-code" aria-label={`Room code ${code}`}>
        {code}
      </div>
      {seat === 'host' && (
        <button className="primary-action" onClick={() => void share()}>
          {copied ? 'Link copied' : 'Share challenge'}
        </button>
      )}
      <p className="connection-note" role="status">
        Live rooms are being wired up for closed alpha. This lobby currently
        validates the complete invite flow without pretending a network match is
        connected.
      </p>
      <Link className="text-link" href="/play/pen-fight?mode=practice">
        Practice while you wait →
      </Link>
    </section>
  );
}

function Recovery({ title, body }: { title: string; body: string }) {
  return (
    <section className="room-card">
      <p className="eyebrow">EMPTY DESK</p>
      <h1>{title}</h1>
      <p>{body}</p>
      <Link className="primary-action inline-action" href="/school">
        Create a new challenge
      </Link>
    </section>
  );
}
