
import styles from './MyPlayer.module.css'
import { FunctionComponent, useState } from 'react'
import { Card, Player } from 'src/types'
import { getSuit } from 'src/shared/helpers'

import { Stack } from '@mui/material'
import Avatar from 'src/shared/components/Avatar'

type MyPlayerProps = {
  myPlayer: Player,
  spectating: boolean,
  roundComplete: boolean,
  safeMessage: string,
  numOfRemainingPlayers: number,
  spectateNext: () => void,
  spectatePrevious: () => void,
  discard: (card: Card) => void,
  fourOfAKind: () => boolean,
  drawFromPile: () => void,
  width: number
}

const MyPlayer : FunctionComponent<MyPlayerProps> = (props) => {

  const myPlayer = props.myPlayer
  const spectating = props.spectating
  const roundComplete = props.roundComplete
  const safeMessage = props.safeMessage
  const numOfRemainingPlayers = props.numOfRemainingPlayers

  const cardDrawn = myPlayer.gameState.cardDrawn
  const pileLength = myPlayer.gameState.pile.length

  const [topPileCardHovered, setTopPileCardHovered] = useState(false)

  const pile = (pileLength: number) => {
    const elems = []
    for (let i = 0; i < pileLength; i++) {
      if (i === pileLength - 1) {
        elems.push(
          <button 
            className={styles.topPileCard} 
            style={
              {
                marginLeft: topPileCardHovered ? `-5px`: `0px`,
                marginTop: pileLength === 1 ? '0px' : `${width > 850 ? -100 : -70}px`
              }
            }
            onClick={() => { props.drawFromPile(); setTopPileCardHovered(false)}}
            disabled={cardDrawn !== undefined || roundComplete || spectating}
            onMouseEnter={() => { if (width > 850) { setTopPileCardHovered(true) }}}
            onMouseLeave={() => { if (width > 850) { setTopPileCardHovered(false) }}}
            key={`pile-card-${i}`} 
          > 

            { (spectating || roundComplete) && ''}
            { !(spectating || roundComplete) &&  
              <>
                <h4>
                  {cardDrawn ? '🚫' : 'DRAW'}
                </h4>
                {cardDrawn ? '' : pileLength}
              </>
            }
          </button>
          )
      } else {
        elems.push(<div key={`pile-card-${i}`}  className={styles.pileCard} style={{marginLeft: `${i === 0 ? pileLength : pileLength-i}px`, marginTop: `${i === 0 ? 0 : (width > 850 ? -100 : -70)}px` }}/>)
      }
    }
    return elems
  }

  const width = props.width
  const cardWidth = width > 850 ? 70 : 50
  const maxPileLength = 52 - 4*(numOfRemainingPlayers) 

  return (
    <div className={styles.container}>
    <Stack>
      <Stack direction="row" justifyContent="center">
        { spectating && 
          <span>
            <button className={styles.spectating} onClick={props.spectateNext}> {'<'}</button> 
          </span>
        }
        <Stack direction="row" justifyContent="center">
          <div className={safeMessage && width <= 850 ? (safeMessage === 'ELIMINATED' ? styles.eliminatedMobile : styles.safeMobile ) : styles.flex}>
            <Avatar
              number={myPlayer.avatar}
              size={30}
            />
            <h3 style={{ marginLeft: '5px', marginTop: '5px'}}>
              {spectating && `SPECTATING: ${myPlayer.nickname}`} 
              {!spectating && `${myPlayer.nickname}`}
              {myPlayer.gameState.dealer ? '👔' : ''}
              {(safeMessage && width > 850) && <span className={safeMessage === 'ELIMINATED' ? styles.eliminated : styles.safe}> {safeMessage} </span>}
            </h3>
          </div>
        </Stack>
        { spectating && 
          <span>
            <button className={styles.spectating} onClick={props.spectatePrevious}> {'>'} </button>
          </span>
        }
      </Stack>
      <div style={{ height: '5px'}}> </div>
      <Stack direction="row" justifyContent="center" flexWrap="nowrap">
        {myPlayer.gameState.hand.map((card, index) => {
          return (
            <Stack key={`card-${index}`}>
              <button 
                className={styles.card} 
                onClick={() => props.discard(card)} 
                disabled={cardDrawn === undefined || spectating || props.fourOfAKind()}
                style={(card.suit === 'diamond' || card.suit === 'heart') ? { color: "red" } : { }}
              > 
                <Stack justifyContent="center">
                  <h4> {getSuit(card.suit)} </h4>
                  <h4> {card.value} </h4>
                </Stack>
              </button>
              { width > 850 && <h3 className={styles.discardText}> REMOVE </h3> }
            </Stack>
          )
        })}
        <div className={styles.cardDrawn}>
          { cardDrawn && 
      
              <Stack> 
                <button 
                  className={styles.card} 
                  disabled={spectating}
                  onClick={() => props.discard(cardDrawn)}
                  style={(cardDrawn.suit === 'diamond' || cardDrawn.suit === 'heart') ? { color: "red" } : { }}
                > 
                  <Stack justifyContent="center">
                    <h4> {getSuit(cardDrawn.suit)} </h4>
                    <h4> {cardDrawn.value} </h4>
                  </Stack>
                </button>
                { width > 850 && <h3 className={styles.discardText}> REMOVE </h3> }
              </Stack>
          } 
          { !cardDrawn && <div className={styles.cardPlaceholder}/> }
        </div>
        <div className={styles.pile} style={{ width: `${cardWidth + maxPileLength}px`}}>
            { pileLength > 0 && pile(pileLength)}
            {!(pileLength > 0 || (roundComplete && !spectating))  && <h4 className={styles.pilePlaceholder}> Wait for card </h4>}
        </div>
      </Stack>
    </Stack>
    </div>
  )
}

export default MyPlayer;