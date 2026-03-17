export type CardType = 'Treasure' | 'Victory' | 'Action' | 'Curse' | 'Reaction';

export interface Card {
  id: string;
  name: string;
  cost: number;
  type: CardType[];
  description: string;
  treasure?: number;
  victoryPoints?: number;
  actions?: number;
  cards?: number;
  buys?: number;
  coins?: number;
  onPlay?: (gameState: any) => any; // We'll refine this
}

export interface PlayerState {
  id: string;
  name: string;
  deck: Card[];
  hand: Card[];
  discard: Card[];
  playArea: Card[];
}

export type GamePhase = 'Action' | 'Buy' | 'Cleanup';

export interface GameState {
  players: PlayerState[];
  currentPlayerIndex: number;
  supply: Record<string, { card: Card; count: number }>;
  trash: Card[];
  phase: GamePhase;
  actions: number;
  buys: number;
  coins: number;
  log: string[];
}
