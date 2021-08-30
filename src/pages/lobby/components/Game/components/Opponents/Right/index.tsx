
import { FunctionComponent  } from "react"
import { Player } from "src/types"
import styles from './Right.module.css'

import Container from "src/shared/layout/Container"
import Flexbox from "src/shared/layout/Flexbox"

type OpponentsRightType = {
  opponents: Player[],
  roundComplete: boolean
}

const OpponentsRight: FunctionComponent<OpponentsRightType>  = (props) => {
  const opponents = props.opponents
  const roundComplete = props.roundComplete

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
            style={{marginLeft: `0px`, marginTop: `${-i}px`, boxShadow: '0px -5px 0px rgba(0, 0, 0, 0.1)'}}
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

  return (
    <Flexbox column center> 
        {renderOpponents().map(p => {
          return (
            <Flexbox key={`opponent-${p.id}`} end>
              <Flexbox column center>
                <h3> {p.nickname} {p.gameState.dealer ? '(DEALER)' : ''}</h3>
                {roundComplete && 
                <h3 className={p.gameState.spoonCollected ? styles.safe : styles.eliminated}> 
                  {p.gameState.spoonCollected && p.gameState.roundWinner && 'WINNER' }
                  {p.gameState.spoonCollected && !p.gameState.roundWinner && 'SAFE' }
                  {!p.gameState.spoonCollected && 'ELIMINATED' }
                </h3>
              }
              </Flexbox>
              <div style={{marginRight: '20px'}}> </div>
              <Flexbox column center>
                <div className={styles.pile}> 
                  { p.gameState.pile.length === 0  && <div className={styles.pilePlaceholder}/>}
                  { p.gameState.pile.length > 0 && renderPile(p.gameState.pile.length)}
                </div>
                {p.gameState.hand.map((_, index) => {
                  return (
                    <div className={styles.card} key={`opponent-card-${index}`}/> 
                  )
                })}
              </Flexbox>
              <div style={{marginRight: '20px'}}> </div>
           </Flexbox >
          )
        })
      }
    </Flexbox>
  )
}

export default OpponentsRight