import { FunctionComponent  } from "react"
import { Player } from "src/types"
import styles from './Left.module.css'

import Flexbox from "src/shared/layout/Flexbox"
import Avatar from "src/shared/components/Avatar"
import { getSuit } from "src/shared/helpers"

type PlayerLeftProps = {
  player: Player,
  roundComplete: boolean,
  width: number,
  maxPileLength: number
}

const PlayerLeft: FunctionComponent<PlayerLeftProps>  = (props) => {
  const player = props.player

  const pile = player.gameState.pile
  const hand = player.gameState.hand
  const cardDrawn = player.gameState.cardDrawn
  const roundWinner = player.gameState.roundWinner
  const spoonCollected = player.gameState.spoonCollected

  const roundComplete = props.roundComplete
  const maxPileLength = props.maxPileLength

  const renderPile = () => {

    let pileLength = pile.length
    if (roundComplete && cardDrawn) {
      pileLength === pile.length + 1
    }

    const elems = []
    for (let i = 0; i < pileLength; i++) {
      if (i === pileLength - 1) {
        elems.push(
          <div 
            key={`player-${player.id}-pile-card-${i}`}
            className={styles.pileCard} 
            style={{marginLeft: `${i}px`, boxShadow: '-4px 0px 0px rgba(0, 0, 0, 0.1)'}}
          >
            {!roundComplete && `${pileLength}`}
          </div>
        )
      } else {
        elems.push(
          <div 
            key={`player-${player.id}-pile-card-${i}`}
            className={styles.pileCard} 
            style={{marginLeft: `${i}px`}}
          />
        )
      }
      
    }
    return elems
  }

  const renderHand = () => {
    let fullHand = hand
    if (cardDrawn) {
      fullHand = hand.concat([cardDrawn])
    }

    const cardHeight = width > 850 ? 50 : 35

    return fullHand.map((card, index) => {
      if (roundComplete && roundWinner) {
        if (index === 4) {
          return null
        }
        return (
          <div 
            className={styles.winnerCard} 
            key={`player-${player.id}-card-${index}`} 
            style={{ 
              color: card.suit === 'diamond' || card.suit === 'heart' ? 'red' : '', 
              marginTop: `${index === 0 ? 0 : -13}px`
            }}
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
            key={`player-${player.id}-card-${index}`}
            style={{
              marginTop: `-${cardHeight}px`, 
              marginLeft: `15px`
            }}
          /> )
      }
      return (
        <div 
          className={styles.card} 
          key={`player-${player.id}-card-${index}`}
          style={{
            marginTop: `${index > 0 ? -cardHeight/2 : 0}px`
          }}
        /> 
      )
    })
  }

  const width = props.width
  const cardWidth = width > 850 ? 70 : 50
  
  return (
    <Flexbox column noWrap> 
      <div 
        style={{
          marginLeft: width > 850 ? '20px' : '5px',
          marginTop: '10px'
       }}
      > 
        <Flexbox noWrap>
          <div className={roundComplete && width <= 850 ? (spoonCollected ? styles.safeMobile : styles.eliminatedMobile ) : styles.flex}>
            <Avatar
              number={player.avatar}
              size={25}
            />
            <h4 style={{ marginLeft: '5px', marginTop: '5px'}}> 
              {player.nickname} 
              {player.gameState.dealer ? '👔' : ''}
              {(roundComplete && width > 850) && 
                <span className={spoonCollected? styles.safe : styles.eliminated}> 
                  {spoonCollected && roundWinner&& 'WINNER' }
                  {spoonCollected && !roundWinner&& 'SAFE' }
                  {!spoonCollected && 'ELIMINATED' }
                </span>
              }
            </h4>
          </div>
        </Flexbox>
        <div style={{ height: '5px'}}/>
        <Flexbox column>
          <Flexbox column>
            {renderHand()}
          </Flexbox>
          <div className={styles.pile} style={{ width: `${cardWidth + maxPileLength}px`}}> 
            { pile.length === 0  && <div className={styles.pilePlaceholder}/>}
            { pile.length > 0 && renderPile()}
          </div>
        </Flexbox >
      </div>
    </Flexbox>
   
  )
}

export default PlayerLeft