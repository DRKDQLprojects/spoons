
import { FunctionComponent  } from "react"
import { Player } from "src/types"
import styles from './Right.module.css'

import Flexbox from "src/shared/layout/Flexbox"
import Avatar from "src/shared/components/Avatar"

type OpponentsRightType = {
  opponents: Player[],
  roundComplete: boolean,
  width: number
}

const OpponentsRight: FunctionComponent<OpponentsRightType>  = (props) => {
  const opponents = props.opponents
  const roundComplete = props.roundComplete
  const width = props.width

  const renderOpponents = () => {
    const numOpponents = opponents.length

    switch (numOpponents) {
      case 3:
        return [opponents[2]]
      case 4: 
        return [opponents[3]]
      case 5:
        return [opponents[4]];
      case 6:
        return [opponents[4], opponents[5]];
      case 7:
        return [opponents[5], opponents[6]];
      case 8:
        return [opponents[6], opponents[7]];
      case 9:
        if (width > 850) return [opponents[7], opponents[8]]
        return [opponents[6], opponents[7], opponents[8]];
      default:
        return []
    }
  }


  const renderPile = (pileLength: number) => {
    const elems = []
    for (let i = pileLength - 1; i >= 0; i--) {
      if (i === 0 && pileLength !== 1) {
        elems.push(
          <div 
            className={styles.pileCard} 
            style={{marginLeft: `${- (pileLength - i)}px`, boxShadow: '4px 0px 0px rgba(0, 0, 0, 0.1)'}}
          />
        )
      } else {
        elems.push(
          <div 
            className={styles.pileCard} 
            style={{ marginLeft: `${- (pileLength - i)}px`}}
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
      const i = fullHand.length - index - 1
      if (roundComplete && p.gameState.roundWinner) {
        if (index === 4) {
          return null
        }
        return (
          <div 
            className={styles.winnerCard} 
            key={`opponent-card-${i}`} 
            style={{ color: card.suit === 'diamond' || card.suit === 'heart' ?  'red' : '', marginTop: `${-10}px`, border: "3px green solid"}}>
            <h4> {card.value} </h4>
            <h4> {getSuit(card.suit)} </h4>
          </div> 
        )
      }
      if (i === 0 && p.gameState.cardDrawn) {
        return (
          <div 
            className={styles.card} 
            key={`opponent-card-${i}`}
            style={{marginTop: '-50px', marginLeft: '-15px'}}
          /> )
      }
      return (
        <div 
          className={styles.card} 
          key={`opponent-card-${i}`}
          style={{ marginTop: `${i === fullHand.length - 1 ? 60 : -70 }px` }}
        /> 
      )
    })
  }

  return (
    <Flexbox column noWrap> 
        {renderOpponents().map(p => {
          return (
            <div key={`opponent-${p.id}`} style={{ marginRight: '20px', marginBottom: '10px', height: '200px'}}>
            <Flexbox column>
                <Flexbox column>
                  <Flexbox end>
                    <Avatar
                      number={p.avatar}
                      size={25}
                    />
                  </Flexbox>
                  <Flexbox end>
                    <h4> {p.nickname} {p.gameState.dealer ? '(DEALER)' : ''}</h4>
                    {roundComplete && 
                    <h4 className={p.gameState.spoonCollected ? styles.safe : styles.eliminated}> 
                      {p.gameState.spoonCollected && p.gameState.roundWinner && 'WINNER' }
                      {p.gameState.spoonCollected && !p.gameState.roundWinner && 'SAFE' }
                      {!p.gameState.spoonCollected && 'ELIMINATED' }
                    </h4>
                    }
                  </Flexbox>
                  <Flexbox end>
                    <div className={styles.pile}> 
                      { p.gameState.pile.length === 0  && <div className={styles.pilePlaceholder}/>}
                      { p.gameState.pile.length > 0 && renderPile(p.gameState.pile.length)}
                    </div>
                  </Flexbox>
                  <Flexbox end>
                    <Flexbox column>
                      {renderHand(p)}
                    </Flexbox>
                  </Flexbox>
                </Flexbox>
           </Flexbox >
           </div>
          )
        })
      }
    </Flexbox>
  )
}

export default OpponentsRight