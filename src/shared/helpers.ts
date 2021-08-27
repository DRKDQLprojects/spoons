import { LobbyInfo, Player } from "src/types"
import { Deck, Card } from "src/types"

export const setupBoard = (players : Player[], settings: any) : any => {
    
  let deck = Deck()
  
  const remainingPlayers = shuffleRemainingPlayers(players)
  if (settings.dealer.on) {
    if (settings.dealer.default) {
      // Random dealer
      const dealerPosition = Math.floor(Math.random() * (remainingPlayers.length - 1));

      

      const playersWithCardSetup = remainingPlayers.map((player, i) => {        
        let [hand, newDeck] = draw(4, deck)
        let pile: Card[] = []
        if (remainingPlayers.length === 2) {
          const [splitPile, newDeck2] = draw(22, newDeck)
          pile = splitPile
          deck = newDeck2
        } else {
          if (i === dealerPosition) {
            let [dealerPile, newDeck2] = draw(52 - (4 * remainingPlayers.length), newDeck)
            pile = dealerPile
            deck = newDeck2
          } else {
            deck = newDeck
          }
        }
        const playerWithCardSetup = {
          ...player,
          // id: player.id,
          gameState: {
            ...player.gameState,
            nextPlayerId: remainingPlayers[(i + 1) % remainingPlayers.length].id,
            hand: hand,
            pile: pile,
            dealer: (i === dealerPosition)
          }
        }
        return playerWithCardSetup
      })

      const dbVal : any = {}
      
      playersWithCardSetup.forEach((player, i) => { 
        dbVal[player.id] =  {
          ...player, 
          id: null
        }
      })
      return dbVal

    } else {
      // TODO: Winner deals
      return []
    }
  } else {
    // TODO: Handle evenly spread deck here
    return []
  }
}

const shuffleRemainingPlayers = (players: Player[]) : Player[] => {
  const remainingPlayers = []
  for (let i = 0; i < players.length; i++) {
    let player = players[i]
    if (player.gameState.remaining) remainingPlayers.push(player)
  }

  const shuffledPlayers = remainingPlayers
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