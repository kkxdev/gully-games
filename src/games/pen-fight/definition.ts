import type { ReactGameDefinition } from '../core/game-ui';
import { PenFightPresentation } from './components/pen-fight-presentation';
import { penFightMetadata } from './metadata';
import type { PenFightState } from './types';
export const penFightDefinition: ReactGameDefinition<PenFightState> = {
  ...penFightMetadata,
  loadRuntime: () => import('./runtime'),
  Presentation: PenFightPresentation,
};
