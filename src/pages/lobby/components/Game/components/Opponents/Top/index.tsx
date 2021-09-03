
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
            style={{marginTop: `${pileLength - i}px`, boxShadow: '0px -4px 0px rgba(0, 0, 0, 0.1)'}}
          />
        )
      } else {
        elems.push(
          <div 
            key={`opponent-pile-card-${i}`} 
            className={styles.pileCard} 
            style={{marginTop: `${pileLength - i}px`}}
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
      const i = fullHand.length - index - 1
      if (roundComplete && p.gameState.roundWinner) {
        if (index === 4) {
          return null
        }
        return (
          <div 
            className={styles.winnerCard} 
            key={`opponent-card-${i}`} 
            style={{ color: card.suit === 'diamond' || card.suit === 'heart' ?  'red' : '', marginLeft: `${i*40}px`, marginTop: `0px`, border: '3px green solid'}}
          >
            <h4> {getSuit(card.suit)} </h4>
            <h4> {card.value} </h4>
          </div> 
        )
      }
      if (i === 0 && p.gameState.cardDrawn) {
        return <div 
          className={styles.card} 
          key={`opponent-card-${i}`}
          id={`${i}`}
          style={{ marginLeft: `0px`, marginTop: `-55px`}}
        /> 
      }
      return (
        <div 
          className={styles.card} 
          key={`opponent-card-${i}`}
          id={`${i}`}
          style={{ marginLeft: `${index === 0 ? 75 : 75 - 25*(index)}px`, marginTop: `${i === fullHand.length - 1 ? 0 : -70}px`}}
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
    <Flexbox spaceEvenly noWrap> 
        {renderOpponents().map(p => {
          return (
            <Flexbox key={`opponent-${p.id}`} column>
                <div className={styles.container}>
                  <Flexbox center>
                    <h4> 
                      {p.nickname} 
                      {p.gameState.dealer ? ' (DEALER)' : ''}
                      {roundComplete && 
                        <span className={p.gameState.spoonCollected ? styles.safe : styles.eliminated}> 
                          {p.gameState.spoonCollected && p.gameState.roundWinner && 'WINNER' }
                          {p.gameState.spoonCollected && !p.gameState.roundWinner && 'SAFE' }
                          {!p.gameState.spoonCollected && 'ELIMINATED' }
                        </span>
                      }
                    </h4>
                  </Flexbox>
                  <div style={{ height: '10px'}}/>
                  <Flexbox>
                    <div className={styles.pile}> 
                          { p.gameState.pile.length === 0  && <div className={styles.pilePlaceholder}/>}
                          { p.gameState.pile.length > 0 && renderPile(p.gameState.pile.length)}
                    </div>
                    <div className={styles.hand}>
                      {renderHand(p)}
                    </div>
                  </Flexbox>
                </div>
           </Flexbox >
          )
        })
      }
    </Flexbox>
  )
}

export default OpponentsTop