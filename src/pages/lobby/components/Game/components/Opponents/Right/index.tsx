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
    for (let i = 0; i < pileLength; i++) {
      if (i === pileLength - 1) {
        elems.push(
          <div 
            className={styles.pileCard} 
            style={{marginRight: `${i}px`, boxShadow: '4px 0px 0px rgba(0, 0, 0, 0.1)'}}
          >
            {!roundComplete && `${pileLength}`}
          </div>
        )
      } else {
        elems.push(
          <div 
            className={styles.pileCard} 
            style={{ marginRight: `${i}px`}}
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

    const cardHeight = width > 850 ? 50 : 40
    const marginTopMarker1 = width > 850 ? 65 : 45
    const marginTopMarker2 = width > 850 ? -72 : -55

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
            style={{ color: card.suit === 'diamond' || card.suit === 'heart' ?  'red' : '', marginTop: `${index === 0 ? 0 : -15}px`, border: "5px green solid"}}>
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
            style={{marginTop: `-${cardHeight}px`, marginLeft: '-15px'}}
          /> )
      }
      return (
        <div 
          className={styles.card} 
          key={`opponent-card-${i}`}
          style={{ marginTop: `${i === fullHand.length - 1 ? marginTopMarker1 : marginTopMarker2 }px` }}
        /> 
      )
    })
  }

  const cardWidth = width > 850 ? 70 : 50
  const maxPileLength = 52 - (4*(opponents.length + 1)) + 3

  return (
    <Flexbox column noWrap> 
        {renderOpponents().map(p => {
          return (
            <div key={`opponent-${p.id}`} style={{ marginRight: width > 850 ? '20px' : '5px', marginBottom: width > 850 ? '35px' : '10px', height: width > 850 ? '180px' : '155px'}}>
            <Flexbox column>
              <Flexbox end noWrap>
                <div className={roundComplete && width <= 850 ? (p.gameState.spoonCollected ? styles.safeMobile : styles.eliminatedMobile ) : styles.flex}>
                  <Avatar
                    number={p.avatar}
                    size={25}
                  />
                  <h4 style={{ marginLeft: '5px', marginTop: '5px'}}> {p.nickname} {p.gameState.dealer ? '(D)' : ''}</h4>
                  {(roundComplete && width > 850) && 
                    <h4 className={p.gameState.spoonCollected ? styles.safe : styles.eliminated}> 
                      {p.gameState.spoonCollected && p.gameState.roundWinner && 'WINNER' }
                      {p.gameState.spoonCollected && !p.gameState.roundWinner && 'SAFE' }
                      {!p.gameState.spoonCollected && 'ELIMINATED' }
                    </h4>
                  }
                </div>
              </Flexbox>
              <Flexbox end>
                <div className={styles.pile} style={{ width: `${cardWidth + maxPileLength}px`}}> 
                    { p.gameState.pile.length === 0  && <div className={styles.pilePlaceholder}/>}
                    { p.gameState.pile.length > 0 && renderPile(p.gameState.pile.length)}
                </div>
              </Flexbox>
              <Flexbox end>
                <Flexbox column>
                  {renderHand(p)}
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