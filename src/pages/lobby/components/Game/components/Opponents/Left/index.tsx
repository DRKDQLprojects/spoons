
import { FunctionComponent  } from "react"
import { Player } from "src/types"
import styles from './Left.module.css'

import Flexbox from "src/shared/layout/Flexbox"

type OpponentsLeftType = {
  opponents: Player[],
  roundComplete: boolean
}

const OpponentsLeft: FunctionComponent<OpponentsLeftType>  = (props) => {
  const opponents = props.opponents
  const roundComplete = props.roundComplete

  const renderOpponents = () => {
    const numOpponents = opponents.length

    switch (numOpponents) {
      case 3:
      case 4: 
      case 5:
        return [opponents[0]];
      case 6:
      case 7:
      case 8:
      case 9:
        return [opponents[0], opponents[1]];
      default:
        return []
    }
  }


  const renderPile = (pileLength: number) => {
    const elems = []
    for (let i = 0; i < pileLength; i++) {
      if (i === pileLength - 1) {
        elems.push(
          <div 
            key={`opponent-pile-card-${i}`}
            className={styles.pileCard} 
            style={{marginLeft: `0px`, marginTop: `${-i}px`, boxShadow: '0px 4px 0px rgba(0, 0, 0, 0.1)'}}
          />
        )
      } else {
        elems.push(
          <div 
            className={styles.pileCard} 
            style={{marginLeft: `0px`, marginTop: `${-i}px`}}
          />
        )
      }
      
    }
    return elems
  }

  const getSuit = (suit: string) => {
    if (suit === 'club') return '♣'
    if (suit === 'diamond') return '♦'
    if (suit === 'heart') return '♥'
    if (suit === 'spade') return '♠'
    return ''
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
              style={{ color: card.suit === 'diamond' || card.suit === 'heart' ?  'red' : '', marginTop: `${156 - (index*52) - 10}px`, marginLeft: '10px' }}>
                <h4> {getSuit(card.suit)} </h4>
                <h4> {card.value} </h4>
            </div> 
          )
        }
        return (
          <div 
            className={styles.winnerCard} 
            key={`opponent-card-${index}`} 
            style={ { color: card.suit === 'diamond' || card.suit === 'heart' ? 'red' : '', marginTop: `${156 - (index*52)}px` }}
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
          style={{marginTop: `${78 - (index*26)}px`}}
        /> 
      )
    })
  }

  return (
    <div style={{marginLeft: '20px'}}> 
    <Flexbox column spaceEvenly> 
        {renderOpponents().map(p => {
          return (
            <Flexbox key={`opponent-${p.id}`} column>
              <Flexbox>
                <h3> 
                  {p.nickname} 
                  {p.gameState.dealer ? ' (DEALER)' : ''}
                </h3> 
                {roundComplete && 
                  <h3>
                    <div className={p.gameState.spoonCollected ? styles.safe : styles.eliminated}> 
                      {p.gameState.spoonCollected && p.gameState.roundWinner && 'WINNER' }
                      {p.gameState.spoonCollected && !p.gameState.roundWinner && 'SAFE' }
                      {!p.gameState.spoonCollected && 'ELIMINATED' }
                    </div>
                  </h3>
                }
              </Flexbox>
              <Flexbox>
                {renderHand(p)}
                <div className={styles.pile} style={{ marginTop: roundComplete && p.gameState.roundWinner ? '156px' : '78px'}}> 
                  { p.gameState.pile.length === 0  && <div className={styles.pilePlaceholder}/>}
                  { p.gameState.pile.length > 0 && renderPile(p.gameState.pile.length)}
                </div>
              </Flexbox>
           </Flexbox >
          )
        })
      }
    </Flexbox>
    </div>
  )
}

export default OpponentsLeft