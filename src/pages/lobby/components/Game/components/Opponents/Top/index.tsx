
import { FunctionComponent  } from "react"
import { Player } from "src/types"
import styles from './Top.module.css'

import Flexbox from "src/shared/layout/Flexbox"

type OpponentsTopType = {
  opponents: Player[],
  roundComplete: boolean
}

const OpponentsTop: FunctionComponent<OpponentsTopType>  = (props) => {
  const opponents = props.opponents
  const roundComplete = props.roundComplete

  const renderOpponents = () => {
    const numOpponents = opponents.length

    switch (numOpponents) {
      case 3:
        return [opponents[1]]
      case 4: 
        return [opponents[1], opponents[2]]
      case 5:
        return [opponents[1], opponents[2], opponents[3]]
      case 6:
        return [opponents[2], opponents[3]]
      case 7:
        return [opponents[2], opponents[3], opponents[4]]
      case 8:
        return [opponents[2], opponents[3], opponents[4], opponents[5]]
      case 9:
        return [opponents[2], opponents[3], opponents[4], opponents[5], opponents[6]]
      default:
        return opponents
    }
  }


  const renderPile = (pileLength: number) => {
    const elems = []
    for (let i = pileLength - 1; i >= 0; i--) {
      if (i === 0 && pileLength !== 1) {
        elems.push(
          <div 
            key={`opponent-pile-card-${i}`} 
            className={styles.pileCard} 
            style={{marginLeft: `${pileLength - i}px`, marginTop: '0px', boxShadow: '-4px 0px 0px rgba(0, 0, 0, 0.1)'}}
          />
        )
      } else {
        elems.push(
          <div 
            key={`opponent-pile-card-${i}`} 
            className={styles.pileCard} 
            style={{marginLeft: `${pileLength - i}px`, marginTop: '0px'}}
          />
        )
      }
      
    }
    return elems
  }

  const renderHand = (p: Player) => {

    let fullHand = p.gameState.hand
    if (p.gameState.cardDrawn) {
      fullHand = p.gameState.hand.concat([p.gameState.cardDrawn])
    }

    return fullHand.map((card, index) => {
      if (roundComplete && p.gameState.roundWinner) {
        if (index === 4) {
          return (
            <div 
              className={styles.winnerCard} 
              key={`opponent-card-${index}`} 
              style={{ color: card.suit === 'diamond' || card.suit === 'heart' ?  'red' : '', marginLeft: `${index*52 + 10}px`, marginTop: '10px' }}>
                <h4> {getSuit(card.suit)} </h4>
                <h4> {card.value} </h4>
            </div> 
          )
        }
        return (
          <div 
            className={styles.winnerCard} 
            key={`opponent-card-${index}`} 
            style={{ color: card.suit === 'diamond' || card.suit === 'heart' ?  'red' : '', marginLeft: `${index*52}px` }}
          >
            <h4> {getSuit(card.suit)} </h4>
            <h4> {card.value} </h4>
          </div> 
        )
      }
      return (
        <div 
          className={styles.card} 
          key={`opponent-card-${index}`}
          style={{ marginLeft: `${index*26}px`}}
        /> 
      )
    })
  }

  const getSuit = (suit: string) => {
    if (suit === 'club') return '♣'
    if (suit === 'diamond') return '♦'
    if (suit === 'heart') return '♥'
    if (suit === 'spade') return '♠'
    return ''
  }

  return (
    <Flexbox spaceEvenly> 
        {renderOpponents().map(p => {
          return (
            <Flexbox key={`opponent-${p.id}`} center>
              <Flexbox column center>
                <h3> 
                  {p.nickname} 
                  {p.gameState.dealer ? ' (DEALER)' : ''}
                  {roundComplete && 
                    <span className={p.gameState.spoonCollected ? styles.safe : styles.eliminated}> 
                      {p.gameState.spoonCollected && p.gameState.roundWinner && 'WINNER' }
                      {p.gameState.spoonCollected && !p.gameState.roundWinner && 'SAFE' }
                      {!p.gameState.spoonCollected && 'ELIMINATED' }
                    </span>
                  }
                </h3>
                <Flexbox column>
                    <div className={styles.hand}>
                      {renderHand(p)}
                    </div>
                    <div className={styles.pile}> 
                      { p.gameState.pile.length === 0  && <div className={styles.pilePlaceholder}/>}
                      { p.gameState.pile.length > 0 && renderPile(p.gameState.pile.length)}
                    </div>
                </Flexbox>
              </Flexbox>
           </Flexbox >
          )
        })
      }
    </Flexbox>
  )
}

export default OpponentsTop