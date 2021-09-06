import { FunctionComponent  } from "react"
import { Player } from "src/types"
import styles from './Top.module.css'

import Flexbox from "src/shared/layout/Flexbox"
import Avatar from "src/shared/components/Avatar"

type OpponentsTopType = {
  opponents: Player[],
  roundComplete: boolean,
  width: number
}

const OpponentsTop: FunctionComponent<OpponentsTopType>  = (props) => {
  const opponents = props.opponents
  const roundComplete = props.roundComplete
  const width = props.width

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
        if (width > 850) return [opponents[2], opponents[3], opponents[4], opponents[5]];
        return [opponents[3], opponents[4], opponents[5]]
      case 9:
        if (width > 850) return [opponents[2], opponents[3], opponents[4], opponents[5], opponents[6]];
        return [opponents[3], opponents[4], opponents[5]]
      default:
        return opponents
    }
  }


  const renderPile = (pileLength: number) => {
    const elems = []
    for (let i = pileLength - 1; i >= 0; i--) {
      if (i === 0) {
        elems.push(
          <div 
            key={`opponent-pile-card-${i}`} 
            className={styles.pileCard} 
            style={{marginTop: `${pileLength - i}px`, boxShadow: '0px -4px 0px rgba(0, 0, 0, 0.1)'}}
          >
            {!roundComplete && `${pileLength}`}
          </div>
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

    const cardHeight = width > 850 ? 70 : 50
    const cardWidth = width > 850 ? 50 : 40

    const marginLeftMarker = width > 850 ? 75 : 45
    const cardShift = width > 850 ? 2 : 3

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
            style={{ color: card.suit === 'diamond' || card.suit === 'heart' ?  'red' : '', marginLeft: `${i*35}px`, marginTop: `0px`, border: '5px green solid'}}
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
          style={{ marginLeft: `${width > 850 ? 0 : 5}px`, marginTop: `${-(cardHeight - 15)}px`}}
        /> 
      }
      return (
        <div 
          className={styles.card} 
          key={`opponent-card-${i}`}
          id={`${i}`}
          style={{ marginLeft: `${index === 0 ? marginLeftMarker : marginLeftMarker - (cardWidth/cardShift)*(index)}px`, marginTop: `${i === fullHand.length - 1 ? 0 : -cardHeight}px`}}
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

  const cardHeight = width > 850 ? 70 : 50
  const maxPileLength = 52 - 4*(opponents.length + 1) - 6

  const renderedOpponents = renderOpponents()
  return (
    <Flexbox spaceEvenly noWrap> 
        {renderedOpponents.map((p,i) => {
          return (
            <Flexbox key={`opponent-${p.id}`} column>
                <div style={{ marginRight : (renderedOpponents.length > 1 && i < renderedOpponents.length - 1) ? '10px': '0px', marginBottom: '10px'}}>
                  <Flexbox center>
                    <Flexbox column noWrap>
                      <Flexbox center>
                        <div className={roundComplete && width <= 850 ? (p.gameState.spoonCollected ? styles.safeMobile : styles.eliminatedMobile ) : styles.flex}>
                          <Avatar
                            number={p.avatar}
                            size={25}
                          />
                          <h4 style={{ marginLeft: '5px', marginTop: '5px'}}> 
                            {p.nickname} 
                            {p.gameState.dealer ? ' (D)' : ''}
                            {(roundComplete && width > 850) && 
                              <span className={p.gameState.spoonCollected ? styles.safe : styles.eliminated}> 
                                {p.gameState.spoonCollected && p.gameState.roundWinner && 'WINNER' }
                                {p.gameState.spoonCollected && !p.gameState.roundWinner && 'SAFE' }
                                {!p.gameState.spoonCollected && 'ELIMINATED' }
                              </span>
                            }
                          </h4>
                        </div>
                      </Flexbox>
                    </Flexbox>
                  </Flexbox>
                  <div style={{ height: '5px'}}/>
                  <Flexbox>
                    <div className={styles.pile} style={{ height: `${cardHeight + maxPileLength}px`}}> 
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