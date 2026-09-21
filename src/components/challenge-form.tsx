'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createRoomCode } from '@/games/pen-fight/realtime/room-code';
import { validateNickname } from '@/lib/guest-profile';
import { trackEvent } from '@/lib/analytics';

const PROFILE_KEY = 'gully-games.guest-nickname';

export function ChallengeForm() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = validateNickname(nickname);
    if (!result.ok) return setError(result.message);
    const code = createRoomCode();
    sessionStorage.setItem(`gully-games.room.${code}.seat`, 'host');
    sessionStorage.setItem(
      `gully-games.room.${code}.token`,
      crypto.randomUUID(),
    );
    localStorage.setItem(PROFILE_KEY, result.nickname);
    trackEvent('challenge_created', { game_id: 'pen-fight' });
    router.push(`/r/${code}`);
  }

  return (
    <form className="challenge-form" onSubmit={submit} noValidate>
      <label htmlFor="nickname">What did your school friends call you?</label>
      <div className="nickname-row">
        <input
          id="nickname"
          name="nickname"
          autoComplete="nickname"
          maxLength={40}
          placeholder="Your nickname"
          value={nickname}
          onChange={(event) => {
            setNickname(event.target.value);
            setError('');
          }}
          aria-describedby="nickname-help nickname-error"
        />
        <button className="primary-action" type="submit">
          Create challenge
        </button>
      </div>
      <small id="nickname-help">
        No account. Your nickname stays on this device for the alpha.
      </small>
      <span id="nickname-error" className="form-error" role="alert">
        {error}
      </span>
    </form>
  );
}
