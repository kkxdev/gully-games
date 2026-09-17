'use client';
import { useEffect, useRef, useState } from 'react';
import type { BaseGameState } from '@/games/core/contracts';
import type { ReactGameDefinition } from '@/games/core/game-ui';
import {
  createRuntimeController,
  type GameHostError,
} from '@/games/core/runtime-controller';

interface HostState<TState> {
  state: TState | null;
  phase: 'loading' | 'ready' | 'error';
  error?: GameHostError;
}
/** The registered component keys this host by game identity. It knows no game rules. */
export function GameHost<TState extends BaseGameState>({
  definition,
}: {
  definition: ReactGameDefinition<TState>;
}) {
  const parent = useRef<HTMLDivElement>(null);
  const controller = useRef<ReturnType<
    typeof createRuntimeController<TState>
  > | null>(null);
  const [host, setHost] = useState<HostState<TState>>({
    state: null,
    phase: 'loading',
  });
  useEffect(() => {
    if (!parent.current) return;
    const owned = createRuntimeController({
      parent: parent.current,
      loadRuntime: definition.loadRuntime,
      onState: (state) => setHost((previous) => ({ ...previous, state })),
      onReady: () => setHost((previous) => ({ ...previous, phase: 'ready' })),
      onError: (error) => {
        if (process.env.NODE_ENV !== 'production')
          console.error(
            `Game ${definition.id} failed during ${error.phase}`,
            error.cause,
          );
        setHost((previous) => ({ ...previous, phase: 'error', error }));
      },
    });
    controller.current = owned;
    return () => {
      owned.destroy();
      if (controller.current === owned) controller.current = null;
    };
  }, [definition]);
  const Presentation = definition.Presentation;
  return (
    <Presentation
      state={host.state}
      restart={() => controller.current?.restart()}
      canRestart={host.phase === 'ready'}
    >
      <div
        className="runtime-mount"
        ref={parent}
        aria-label={`${definition.name} play area`}
      />
      {host.phase !== 'ready' && (
        <p className="host-notice" role="status" aria-live="polite">
          {host.phase === 'error'
            ? 'This game could not start or continue. Please refresh to try again.'
            : `Loading ${definition.name}…`}
        </p>
      )}
    </Presentation>
  );
}
