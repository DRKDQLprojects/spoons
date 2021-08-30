
import { FunctionComponent  } from "react"
import { Player } from "src/types"
import styles from './Left.module.css'

import Container from "src/shared/layout/Container"
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
        return [opponents[0], opponents[1]];
      case 9:
        return [opponents[0], opponents[1], opponents[2]];
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
            style={{marginLeft: `0px`, marginTop: `${i}px`, boxShadow: '-5px 0px 0px rgba(0, 0, 0, 0.1)'}}
          />
        )
      } else {
        elems.push(
          <div 
            className={styles.pileCard} 
            style={{marginLeft: `0px`, marginTop: `${i}px`}}
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
            <Flexbox key={`opponent-${p.id}`}>
              <div style={{marginLeft: '20px'}}/>
              <Flexbox column center>
                {p.gameState.hand.map((_, index) => {
                  return (
                    <div className={styles.card} key={`opponent-card-${index}`}/> 
                  )
                })}
                 <div className={styles.pile}> 
                  { p.gameState.pile.length === 0  && <div className={styles.pilePlaceholder}/>}
                  { p.gameState.pile.length > 0 && renderPile(p.gameState.pile.length)}
                </div>
              </Flexbox>
              <div style={{marginLeft: '20px'}}/>
              <Flexbox column center>
                <h3> 
                  {p.nickname} 
                  {p.gameState.dealer ? ' (DEALER)' : ''}
                </h3>
                <h3>
                {roundComplete && 
                    <div className={p.gameState.spoonCollected ? styles.safe : styles.eliminated}> 
                      {p.gameState.spoonCollected && p.gameState.roundWinner && 'WINNER' }
                      {p.gameState.spoonCollected && !p.gameState.roundWinner && 'SAFE' }
                      {!p.gameState.spoonCollected && 'ELIMINATED' }
                    </div>
                }
                </h3>
              </Flexbox>
           </Flexbox >
          )
        })
      }
    </Flexbox>
  )
}

export default OpponentsLeft