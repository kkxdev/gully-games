import { createGameRegistry } from './core/registry';
export const gameRegistry = createGameRegistry([
  { id: 'pen-fight', name: 'Pen Fight', description: 'One desk. Two pens. A very serious lunch-break rivalry.', players: '1 vs CPU', location: 'School desk', status: 'playable', load: () => import('./pen-fight/runtime') },
  { id: 'kanche', name: 'Kanche', description: 'A pocketful of marbles, a circle in the dust.', players: '1–2', location: 'Gully', status: 'planned' },
  { id: 'book-cricket', name: 'Book Cricket', description: 'The next page could be a six.', players: '1–2', location: 'School desk', status: 'planned' },
  { id: 'hand-cricket', name: 'Hand Cricket', description: 'An entire stadium in the palm of your hand.', players: '1–2', location: 'School courtyard', status: 'planned' },
]);
