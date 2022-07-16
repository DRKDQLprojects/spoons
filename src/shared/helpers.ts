import { emptyGameState, emptyPlayer, Player } from "src/types"
import { Deck, Card } from "src/types"

export const convertToDBPlayers = (players: Player[]) => {
  let dbArray : any = {}
  players.forEach((player, i) => { 
    dbArray[player.id] =  {
      ...player, 
      id: null
    }
  })
  return dbArray
}

export const convertToPlayers = (players: any): Player[] => {
  return Object.keys(players).map(pid => {
    const player : Player = {
      ...players[pid],
      id: pid,
      gameState: {
        ...players[pid].gameState,
        hand: players[pid].gameState.hand || [],
        pile: players[pid].gameState.pile || []
        
      }
    }
    return player
  })
}

export const setupBoard = (players : Player[], settings: any, round: number) : any => {
    
  let deck = Deck()

  let _players = players;
  if (settings.shuffle) {
    _players = shufflePlayers(_players)
  } 


  const winner = round > 0 ? _players.filter(p => p.gameState.roundWinner)[0] : emptyPlayer

  const resettedPlayers = resetPlayers(_players, round) 
  const remainingPlayers = resettedPlayers.filter(p => p.gameState.remaining)

  let finalPlayers = convertToDBPlayers(resettedPlayers)

  if (settings.dealer.on && remainingPlayers.length > 2) {
    
    // Random Dealer
    let dealer;
    if (settings.dealer.default) {
      dealer = remainingPlayers[Math.floor(Math.random() * remainingPlayers.length)]

    // Winner deals
    } else {
      if (round === 0) {
        dealer = remainingPlayers[Math.floor(Math.random() * remainingPlayers.length)]
      } else {
        dealer = remainingPlayers.filter(p => p.id === winner.id)[0]
      }
    }

    // Draw Hands
    for (let i = 0; i < 4 * remainingPlayers.length; i++) {
      if (i === 4 * remainingPlayers.length) {
        break;
      }

      const x = i % remainingPlayers.length;
      const playerId = remainingPlayers[x].id

      const player = finalPlayers[playerId]
      const gameState = player.gameState

      const card = deck[i]

      finalPlayers = {
        ...finalPlayers,
        [playerId]: {
          ...player,
          gameState: {
            ...gameState,
            hand: gameState.hand.concat([card]),
          }
        }
      }
    }
    
    // Draw Dealer Piles
    finalPlayers[dealer.id].gameState.dealer = true
    for (let i = 4 * remainingPlayers.length; i < deck.length; i++) {
      const player = finalPlayers[dealer.id]
      const gameState = player.gameState
      const card = deck[i]

      finalPlayers = {
        ...finalPlayers,
        [dealer.id]: {
          ...player,
          gameState: {
            ...gameState,
            pile: gameState.pile.concat([card])
          }
        }
      }
    }

    return finalPlayers
  } 

  // Spread the deck evenly
  deck.forEach((card, i) => {
    const x = i % remainingPlayers.length;
    const playerId = remainingPlayers[x].id

    const player = finalPlayers[playerId]
    const gameState = player.gameState

    let drawHand = true
    if (gameState.hand.length === 4) {
      drawHand = false
    }
    finalPlayers = {
      ...finalPlayers,
      [playerId]: {
        ...player,
        gameState: {
          ...gameState,
          hand: drawHand ? gameState.hand.concat([card]) : gameState.hand,
          pile: !drawHand ? gameState.pile.concat([card]) : gameState.pile
        }
      }
    }

  })
  return finalPlayers
  
}

const shufflePlayers = (players: Player[]) : Player[] => {
  const shuffledPlayers = players
  for (let i = shuffledPlayers.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * i);
    let temp = shuffledPlayers[i]
    shuffledPlayers[i] = shuffledPlayers[j]
    shuffledPlayers[j] = temp
  }
  return shuffledPlayers
}

const resetPlayers = (players: Player[], round: number) : Player[] => {
  const resettedPlayers = players.map((p, i) => {
    if (round === 0) {
      return {
        ...p,
        gameState: {
          ...emptyGameState,
          remaining: true
        }
      }
    } 

    if (p.gameState.toBeEliminated) {
      return {
        ...p,
        gameState: {
          ...emptyGameState,
          toBeEliminated: true,
          remaining: false
        }
      }
    } 

    if (p.gameState.remaining) {
      return {
        ...p,
        gameState: {
          ...emptyGameState,
          remaining: true
        }
      }
    }

    return p
  })

  let finalPlayers = convertToDBPlayers(resettedPlayers); 

  const remainingPlayers = resettedPlayers.filter(p => p.gameState.remaining)
  remainingPlayers.forEach((p, i) => {
    finalPlayers = {
      ...finalPlayers,
      [p.id] : {
        ...p,
        gameState: {
          ...p.gameState,
          previousPlayerId: remainingPlayers[(i + remainingPlayers.length - 1) % remainingPlayers.length].id,
          nextPlayerId: remainingPlayers[(i + 1) % remainingPlayers.length].id,
        }
      }
    }
  })
  return convertToPlayers(finalPlayers)

} 

const draw = (amount: number, deck: Card[]) : { cards: Card[], remainingDeck: Card[]} => {
  const cards = deck.filter((_, index) => index < amount)
  const remainingDeck = deck.filter((_, index) => index >= amount)
  return {
    cards: cards,
    remainingDeck: remainingDeck
  }
}

export const getSuit = (suit: string) => {
  if (suit === 'club') return '♣'
  if (suit === 'diamond') return '♦'
  if (suit === 'heart') return '♥'
  if (suit === 'spade') return '♠'
  return ''
}

export const getMaxPileLength = (numPlayers: number) => {
  return 52 - 4*(numPlayers)
}

export const playersToRender = (opponents: Player[], section: 'top' | 'left' | 'bottom' |'right') => {

  const numOpponents = opponents.length

  if (section === 'top') {
    switch (numOpponents) {
      case 3:
        return [opponents[1]]
      case 4: 
        return [opponents[1], opponents[2]]
      case 5:
        return [opponents[1], opponents[2], opponents[3]]
      case 6:
        return [opponents[1], opponents[2], opponents[3], opponents[4]]
      case 7:
        return [opponents[1], opponents[2], opponents[3], opponents[4], opponents[5]]
      case 8:
      case 9:
        return [opponents[2], opponents[3], opponents[4], opponents[5], opponents[6]];
      default:
        return opponents
    }
  }

  if (section === 'left') {
    switch (numOpponents) {
      case 3:
      case 4: 
      case 5:
      case 6:
      case 7:
        return [opponents[0]];
      case 8:
      case 9:
        return [opponents[1]];
      default:
        return []
    }
  }

  if (section === 'right') {
    const numOpponents = opponents.length
    switch (numOpponents) {
      case 3:
        return [opponents[2]]
      case 4: 
        return [opponents[3]]
      case 5:
        return [opponents[4]];
      case 6:
        return [opponents[5]];
      case 7:
        return [opponents[6]];
      case 8:
      case 9:
        return [opponents[7]]
      default:
        return []
    }
  }
  return []
}
