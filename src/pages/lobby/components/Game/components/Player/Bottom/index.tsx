import { FunctionComponent  } from "react"
import { Player } from "src/types"
import styles from './Bottom.module.css'

import { Stack } from '@mui/material';
import Avatar from "src/shared/components/Avatar"
import { getSuit } from "src/shared/helpers"

type PlayerBottomProps = {
  player: Player,
  roundComplete: boolean,
  width: number,
  maxPileLength: number
}

const PlayerBottom: FunctionComponent<PlayerBottomProps>  = (props) => {
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
      if (i === pileLength-1) {
        elems.push(
          <div 
            key={`player-${player.id}-pile-card-${i}`} 
            className={styles.pileCard} 
            style={{marginBottom: `${i}px`, boxShadow: '0px -4px 0px rgba(0, 0, 0, 0.1)'}}
          >
            {!roundComplete && `${pileLength}`}
          </div>
        )
      } else {
        elems.push(
          <div 
            key={`player-${player.id}-pile-card-${i}`} 
            className={styles.pileCard} 
            style={{marginBottom: `${i}px`}}
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

    const cardWidth = width > 850 ? 50 : 35

    return fullHand.map((card, index) => {
      const i = (fullHand.length - 1) - index
      if (roundComplete && roundWinner) {
        if (index === 4) {
          return null
        }
        return (
          <div 
            className={styles.winnerCard} 
            key={`player-${player.id}-card-${i}`} 
            style={{ 
              color: card.suit === 'diamond' || card.suit === 'heart' ?  'red' : '', 
              marginLeft: `${index === 0 ? 0 : -((cardWidth/2) * 0.8)}px`, 
              marginTop: `0px`
            }}
          >
            <h4> {getSuit(card.suit)} </h4>
            <h4> {card.value} </h4>
          </div> 
        )
      }
      if (index === 4 && cardDrawn) {
        return (
          <div 
            className={styles.card} 
            key={`player-${player.id}-card-${i}`}
            style={{ 
              marginLeft: `-${cardWidth}px`, 
              marginTop: '-15px'
            }}
          /> 
        )
      }
      return (
        <div 
          className={styles.card} 
          key={`player-${player.id}-card-${i}`}
          style={{ 
            marginLeft: `${index === 0 ? 0 : -(cardWidth / 2)}px`
          }}
        /> 
      )
    })
  }

  const width = props.width
  const cardHeight = width > 850 ? 70 : 50

  return (
    <Stack justifyContent="flex-end">
      <Stack direction="row" justifyContent="center" flexWrap="nowrap">
        <div className={roundComplete && width <= 850 ? (spoonCollected? styles.safeMobile : styles.eliminatedMobile ) : styles.flex}>
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
      </Stack>
      <div style={{ height: '5px'}}/>
      <Stack direction="row" flexWrap="nowrap">
        <Stack justifyContent="flex-end">
          <Stack direction="row">
            {renderHand()}
          </Stack>
        </Stack>
        <div 
          className={styles.pile} 
          style={{ 
            height: `${cardHeight + maxPileLength}px`
          }}
        > 
          { pile.length === 0  && <div className={styles.pilePlaceholder}/>}
          { pile.length > 0 && renderPile()}
        </div>
        
      </Stack>
    </Stack >
  )
}

export default PlayerBottom