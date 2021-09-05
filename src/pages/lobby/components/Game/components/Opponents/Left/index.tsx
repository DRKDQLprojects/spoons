
import { FunctionComponent  } from "react"
import { Player } from "src/types"
import styles from './Left.module.css'

import Flexbox from "src/shared/layout/Flexbox"
import Avatar from "src/shared/components/Avatar"

type OpponentsLeftType = {
  opponents: Player[],
  roundComplete: boolean,
  width: number
}

const OpponentsLeft: FunctionComponent<OpponentsLeftType>  = (props) => {
  const opponents = props.opponents
  const roundComplete = props.roundComplete
  const width = props.width

  const renderOpponents = () => {
    const numOpponents = opponents.length

    switch (numOpponents) {
      case 3:
      case 4: 
      case 5:
        return [opponents[0]];
      case 6:
      case 7:
        return [opponents[1], opponents[0]];
      case 8:
        if (width > 850) return [opponents[1], opponents[0]];
      case 9:
        if (width > 850) return [opponents[1], opponents[0]];
        return [opponents[2], opponents[1], opponents[0]];
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
            style={{marginLeft: `${i}px`, boxShadow: '-4px 0px 0px rgba(0, 0, 0, 0.1)'}}
          />
        )
      } else {
        elems.push(
          <div 
            key={`opponent-pile-card-${i}`}
            className={styles.pileCard} 
            style={{marginLeft: `${i}px`}}
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
          return null
        }
        return (
          <div 
            className={styles.winnerCard} 
            key={`opponent-card-${index}`} 
            style={ { color: card.suit === 'diamond' || card.suit === 'heart' ? 'red' : '', marginTop: `${(-10)}px`, border: '3px green solid' }}
          >
            <h4> {getSuit(card.suit)} </h4>
            <h4> {card.value} </h4>
          </div>
        )
      }
      if (index === 4) {
        return (
          <div 
            className={styles.card} 
            key={`opponent-card-${index}`}
            style={{marginTop: `-50px`, marginLeft: `15px`}}
          /> )
      }
      return (
        <div 
          className={styles.card} 
          key={`opponent-card-${index}`}
          style={{marginTop: `${index > 0 ? -26 : 0}px`}}
        /> 
      )
    })
  }

  return (
    
    <Flexbox column noWrap> 
        {renderOpponents().map(p => {
          return (
            <div key={`opponent-${p.id}`} style={{marginTop: '10px', marginLeft: '20px', marginBottom: '10px', height: '200px'}}> 
            <Avatar
              number={p.avatar}
              size={25}
            />
            <Flexbox>
              <h4 className={styles.name}> 
                {p.nickname} 
                {p.gameState.dealer ? ' (DEALER)' : ''}
              </h4> 
              {roundComplete && 
                <h4>
                  <div className={p.gameState.spoonCollected ? styles.safe : styles.eliminated}> 
                    {p.gameState.spoonCollected && p.gameState.roundWinner && 'WINNER' }
                    {p.gameState.spoonCollected && !p.gameState.roundWinner && 'SAFE' }
                    {!p.gameState.spoonCollected && 'ELIMINATED' }
                  </div>
                </h4>
              }
            </Flexbox>
            <Flexbox column>
              <Flexbox column>
                {renderHand(p)}
              </Flexbox>
              <div className={styles.pile}> 
                { p.gameState.pile.length === 0  && <div className={styles.pilePlaceholder}/>}
                { p.gameState.pile.length > 0 && renderPile(p.gameState.pile.length)}
              </div>
           </Flexbox >
           </div>
          )
        })
      }
    </Flexbox>
   
  )
}

export default OpponentsLeft