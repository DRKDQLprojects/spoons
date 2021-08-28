import { emptyGameState, LobbyInfo, Player } from "src/types"
import { Deck, Card } from "src/types"

export const setupBoard = (players : Player[], settings: any, startingRound: boolean) : any => {
    
  let deck = Deck()
  
  let shuffledPlayers = shufflePlayers(players)

  if (settings.dealer.on) {
    if (settings.dealer.default) {
      let remainingPlayers : Player[];
      if (startingRound) {
        // Round 0 - everyone remains
        remainingPlayers = shuffledPlayers.map(p => {
          return {
            ...p,
            gameState: {
              ...p.gameState,
              remaining: true
            }
          }
        })
        shuffledPlayers = remainingPlayers
      } else {
        remainingPlayers = shuffledPlayers.filter(p => p.gameState.remaining && !p.gameState.toBeEliminated)
      }
      // Random dealer
      const dealer = remainingPlayers[Math.floor(Math.random() * remainingPlayers.length)];

      const playersWithCardSetup = shuffledPlayers.map((player, i) => { 
        if (player.gameState.remaining) {
          if (player.gameState.toBeEliminated) {
            return {
              ...player,
              gameState: { 
                ...emptyGameState,
                remaining: false
              }
            }
          }

          let [hand, newDeck] = draw(4, deck)
          let pile: Card[] = []
          if (remainingPlayers.length === 2) {
            const [splitPile, newDeck2] = draw(22, newDeck)
            pile = splitPile
            deck = newDeck2
          } else {
            if (player.id === dealer.id) {
              let [dealerPile, newDeck2] = draw(52 - (4 * remainingPlayers.length), newDeck)
              pile = dealerPile
              deck = newDeck2
            } else {
              deck = newDeck
            }
          }
          const x = remainingPlayers.findIndex((p) => p === player)
          const playerWithCardSetup = {
            ...player,
            gameState: {
              ...player.gameState,
              previousPlayerId: remainingPlayers[(x + remainingPlayers.length - 1) % remainingPlayers.length].id,
              nextPlayerId: remainingPlayers[(x + 1) % remainingPlayers.length].id,
              hand: hand,
              pile: pile,
              dealer: (player.id === dealer.id),
              spoonCollected: false,
            }
          }
          return playerWithCardSetup
        } else {
          return {
            ...player,
            gameState: {
              ...emptyGameState,
              toBeEliminated: false
            }
          }
        }
      })
      return convertPlayerArrayToDBArray(playersWithCardSetup)
    } else {
      // TODO: Winner deals
      return []
    }
  } else {
    // TODO: Handle evenly spread deck here
    return []
  }
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

const draw = (amount: number, deck: Card[]) : [Card[], Card[]] => {
  const hand = deck.filter((_, index) => index < amount)
  const remainingDeck = deck.filter((_, index) => index >= amount)
  return [hand, remainingDeck]
}

export const convertPlayerArrayToDBArray = (players: Player[]) => {
  let dbArray : any = {}
  players.forEach((player, i) => { 
    dbArray[player.id] =  {
      ...player, 
      id: null
    }
  })
  return dbArray
}