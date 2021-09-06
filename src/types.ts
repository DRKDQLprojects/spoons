export type LobbyInfo = {
  id: string,
  gameStatus : GameStatus, 
  players: Player[],
  settings: Settings
}

export type Player = {
  id: string,
  avatar: number,
  isHost: boolean,
  nickname: string,
  gameState: PlayerGameState
}

export type Card = {
  value: string,
  suit: string
}

export const CardValues = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
export const CardSuits = ['heart', 'diamond', 'spade', 'club']

export const Deck = () : Card[] => {
  let deck : Card[] = []
  for (let i = 0; i < CardSuits.length; i++) {
    for (let j = 0; j < CardValues.length; j++) {
      deck.push({ value: CardValues[j], suit: CardSuits[i] })
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * i)
    let temp = deck[i];
    deck[i] = deck[j]
    deck[j] = temp;
  }
  return deck
}

export type PlayerGameState = {
  remaining: boolean
  hand: Card[],
  pile: Card[],
  cardDrawn?: Card,
  previousPlayerId: string,
  nextPlayerId: string,
  spoonCollected: boolean,
  dealer: boolean,
  toBeEliminated: boolean,
  roundWinner: boolean
}

export type GameStatus = {
  round: number,
  numRounds: number,
  countdownStarted: boolean,
  spoonStatuses: SpoonStatus[]
}

export type Settings = {
  dealer: {
    default: boolean,
    on: boolean,
  },
  peek : {
    on : boolean,
    cooldown: number,
    timer: number
  },
  shuffle: boolean,
  clicksToCollect: number
}

export type SpoonStatus = (boolean | string[])[] // false = not collected yet, true = collected by winner, string[] = IDs of people who have clicked spoon

// Empty Types

export const emptyGameState : PlayerGameState = {
  remaining: false,
  hand: [],
  pile: [],
  spoonCollected: false,
  previousPlayerId: '',
  nextPlayerId: '',
  dealer: false,
  toBeEliminated: false,
  roundWinner: false
} 

export const emptyPlayer : Player = {
  id: '',
  avatar: 0,
  isHost: false,
  nickname: '',
  gameState: emptyGameState
}

export const emptyGameStatus : GameStatus = {
  round: 0,
  numRounds: 0,
  countdownStarted: false,
  spoonStatuses: []
}

export const emptySettings : Settings = {
  dealer: {
    on: true,
    default: true,
  },
  peek : {
    on: true,
    cooldown: 2,
    timer: 4
  },
  shuffle: false,
  clicksToCollect: 1
}

export const emptyLobbyInfo : LobbyInfo = {
  id: '',
  gameStatus : emptyGameStatus, 
  players: [],
  settings: emptySettings
}


