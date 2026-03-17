import { Card } from './types';

export const TREASURES: Record<string, Card> = {
  copper: {
    id: 'copper',
    name: 'Copper',
    cost: 0,
    type: ['Treasure'],
    description: '+1 Coin',
    treasure: 1,
  },
  silver: {
    id: 'silver',
    name: 'Silver',
    cost: 3,
    type: ['Treasure'],
    description: '+2 Coins',
    treasure: 2,
  },
  gold: {
    id: 'gold',
    name: 'Gold',
    cost: 6,
    type: ['Treasure'],
    description: '+3 Coins',
    treasure: 3,
  },
};

export const VICTORY: Record<string, Card> = {
  estate: {
    id: 'estate',
    name: 'Estate',
    cost: 2,
    type: ['Victory'],
    description: '1 Victory Point',
    victoryPoints: 1,
  },
  duchy: {
    id: 'duchy',
    name: 'Duchy',
    cost: 5,
    type: ['Victory'],
    description: '3 Victory Points',
    victoryPoints: 3,
  },
  province: {
    id: 'province',
    name: 'Province',
    cost: 8,
    type: ['Victory'],
    description: '6 Victory Points',
    victoryPoints: 6,
  },
  curse: {
    id: 'curse',
    name: 'Curse',
    cost: 0,
    type: ['Curse'],
    description: '-1 Victory Point',
    victoryPoints: -1,
  },
};

export const ACTION_CARDS: Record<string, Card> = {
  smithy: {
    id: 'smithy',
    name: 'Smithy',
    cost: 4,
    type: ['Action'],
    description: '+3 Cards',
    cards: 3,
  },
  village: {
    id: 'village',
    name: 'Village',
    cost: 3,
    type: ['Action'],
    description: '+1 Card, +2 Actions',
    cards: 1,
    actions: 2,
  },
  market: {
    id: 'market',
    name: 'Market',
    cost: 5,
    type: ['Action'],
    description: '+1 Card, +1 Action, +1 Buy, +1 Coin',
    cards: 1,
    actions: 1,
    buys: 1,
    coins: 1,
  },
  woodcutter: {
    id: 'woodcutter',
    name: 'Woodcutter',
    cost: 3,
    type: ['Action'],
    description: '+1 Buy, +2 Coins',
    buys: 1,
    coins: 2,
  },
};

export const ALL_CARDS = {
  ...TREASURES,
  ...VICTORY,
  ...ACTION_CARDS,
};
