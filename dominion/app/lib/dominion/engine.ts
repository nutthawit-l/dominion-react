import { Card, GameState, PlayerState, GamePhase } from './types';
import { ALL_CARDS } from './cards';

export const INITIAL_DECK = [
  ...Array(7).fill(ALL_CARDS.copper),
  ...Array(3).fill(ALL_CARDS.estate),
];

export function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function createInitialState(playerNames: string[]): GameState {
  const players: PlayerState[] = playerNames.map((name, index) => {
    const shuffledDeck = shuffle(INITIAL_DECK.map(c => ({ ...c, id: `${c.id}-${index}-${Math.random()}` })));
    const hand = shuffledDeck.slice(0, 5);
    const deck = shuffledDeck.slice(5);
    
    return {
      id: `player-${index}`,
      name,
      deck,
      hand,
      discard: [],
      playArea: [],
    };
  });

  const supply: Record<string, { card: Card; count: number }> = {
    copper: { card: ALL_CARDS.copper, count: 60 - (players.length * 7) },
    silver: { card: ALL_CARDS.silver, count: 40 },
    gold: { card: ALL_CARDS.gold, count: 30 },
    estate: { card: ALL_CARDS.estate, count: players.length === 2 ? 8 : 12 },
    duchy: { card: ALL_CARDS.duchy, count: players.length === 2 ? 8 : 12 },
    province: { card: ALL_CARDS.province, count: players.length === 2 ? 8 : 12 },
    curse: { card: ALL_CARDS.curse, count: (players.length - 1) * 10 },
  };

  // Add 10 kingdom action cards to the supply
  const actionCards = ['smithy', 'village', 'market', 'woodcutter', 'smithy', 'village', 'market', 'woodcutter', 'smithy', 'village', '市场', '伐木工'];
  // Actually, I'll just use what I have and repeat some if needed, but let's define more in cards.ts later
  // For now, let's just make it 10 slots
  const selectedActionCards = ['smithy', 'village', 'market', 'woodcutter', 'smithy', 'village', 'market', 'woodcutter', 'smithy', 'village'].slice(0, 10);
  
  selectedActionCards.forEach((id, idx) => {
    supply[`action-${idx}`] = { card: { ...ALL_CARDS[id] || ALL_CARDS.smithy, id: `action-${idx}` }, count: 10 };
  });

  return {
    players,
    currentPlayerIndex: 0,
    supply,
    trash: [],
    phase: 'Action',
    actions: 1,
    buys: 1,
    coins: 0,
    log: ['Game started!'],
  };
}

export function drawCards(player: PlayerState, count: number): PlayerState {
  let { deck, hand, discard } = player;
  const newHand = [...hand];
  const newDeck = [...deck];
  const newDiscard = [...discard];

  for (let i = 0; i < count; i++) {
    if (newDeck.length === 0) {
      if (newDiscard.length === 0) break;
      const shuffled = shuffle(newDiscard);
      newDeck.push(...shuffled);
      newDiscard.length = 0;
    }
    const card = newDeck.pop();
    if (card) newHand.push(card);
  }

  return { ...player, hand: newHand, deck: newDeck, discard: newDiscard };
}

export function playAction(state: GameState, cardIndex: number): GameState {
  if (state.phase !== 'Action' || state.actions <= 0) return state;

  const player = state.players[state.currentPlayerIndex];
  const card = player.hand[cardIndex];

  if (!card.type.includes('Action')) return state;

  const newHand = [...player.hand];
  newHand.splice(cardIndex, 1);
  const newPlayArea = [...player.playArea, card];

  let newState = {
    ...state,
    actions: state.actions - 1,
    players: state.players.map((p, i) => 
      i === state.currentPlayerIndex ? { ...p, hand: newHand, playArea: newPlayArea } : p
    ),
    log: [...state.log, `${player.name} played ${card.name}`],
  };

  // Apply card effects
  if (card.cards) {
    newState.players[newState.currentPlayerIndex] = drawCards(newState.players[newState.currentPlayerIndex], card.cards);
  }
  if (card.actions) {
    newState.actions += card.actions;
  }
  if (card.buys) {
    newState.buys += card.buys;
  }
  if (card.coins) {
    newState.coins += card.coins;
  }

  return newState;
}

export function playTreasure(state: GameState, cardIndex: number): GameState {
  if (state.phase !== 'Buy' && state.phase !== 'Action') return state; // In Dominion, treasures are played in Buy phase, but we can allow transitions
  
  const newState = { ...state, phase: 'Buy' as GamePhase };
  const player = newState.players[newState.currentPlayerIndex];
  const card = player.hand[cardIndex];

  if (!card.type.includes('Treasure')) return newState;

  const newHand = [...player.hand];
  newHand.splice(cardIndex, 1);
  const newPlayArea = [...player.playArea, card];

  return {
    ...newState,
    coins: newState.coins + (card.treasure || 0),
    players: newState.players.map((p, i) => 
      i === newState.currentPlayerIndex ? { ...p, hand: newHand, playArea: newPlayArea } : p
    ),
    log: [...newState.log, `${player.name} played ${card.name}`],
  };
}

export function buyCard(state: GameState, supplyId: string): GameState {
  if (state.phase !== 'Buy' || state.buys <= 0) return state;

  const supplyItem = state.supply[supplyId];
  if (!supplyItem || supplyItem.count <= 0 || state.coins < supplyItem.card.cost) return state;

  const player = state.players[state.currentPlayerIndex];
  const newDiscard = [...player.discard, { ...supplyItem.card, id: `${supplyItem.card.id}-${Math.random()}` }];

  return {
    ...state,
    buys: state.buys - 1,
    coins: state.coins - supplyItem.card.cost,
    supply: {
      ...state.supply,
      [supplyId]: { ...supplyItem, count: supplyItem.count - 1 },
    },
    players: state.players.map((p, i) => 
      i === state.currentPlayerIndex ? { ...p, discard: newDiscard } : p
    ),
    log: [...state.log, `${player.name} bought ${supplyItem.card.name}`],
  };
}

export function endTurn(state: GameState): GameState {
  const player = state.players[state.currentPlayerIndex];
  
  // Cleanup phase
  const newDiscard = [...player.discard, ...player.hand, ...player.playArea];
  let updatedPlayer: PlayerState = { ...player, hand: [], playArea: [], discard: newDiscard };
  updatedPlayer = drawCards(updatedPlayer, 5);

  const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;

  return {
    ...state,
    players: state.players.map((p, i) => i === state.currentPlayerIndex ? updatedPlayer : p),
    currentPlayerIndex: nextPlayerIndex,
    phase: 'Action',
    actions: 1,
    buys: 1,
    coins: 0,
    log: [...state.log, `--- ${state.players[nextPlayerIndex].name}'s turn ---`],
  };
}
