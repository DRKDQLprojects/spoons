
import { FunctionComponent  } from "react"
import { Player } from "src/types"
import styles from './Top.module.css'

import Container from "src/shared/layout/Container"
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
        return [opponents[1], opponents[2], opponents[3]];
      case 6:
        return [opponents[3], opponents[3]];
      case 7:
        return [opponents[2], opponents[3], opponents[4]];
      case 8:
        return [opponents[2], opponents[3], opponents[4], opponents[5]];
      case 9:
        return [opponents[3], opponents[4], opponents[5]];
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
            className={styles.pileCard} 
            style={{marginLeft: `${-i}px`, marginTop: '0px', boxShadow: '-5px 0px 0px rgba(0, 0, 0, 0.1)'}}
          />
        )
      } else {
        elems.push(
          <div 
            className={styles.pileCard} 
            style={{marginLeft: `${-i}px`, marginTop: '0px'}}
          />
        )
      }
      
    }
    return elems
  }

  return (
    <Flexbox spaceEvenly> 
        {renderOpponents().map(p => {
          return (
            <Flexbox key={`opponent-${p.id}`} center>
              <Flexbox column>
                <Container>
                  <h3> 
                    {p.nickname} 
                    {p.gameState.dealer ? ' (DEALER)' : ''}
                    {roundComplete && 
                      <span className={p.gameState.spoonCollected ? styles.safe : styles.eliminated}> 
                        {p.gameState.spoonCollected && p.gameState.roundWinner && 'WINNER' }
                        {p.gameState.spoonCollected && !p.gameState.roundWinner && 'SAFE' }
                        {!p.gameState.spoonCollected && 'ELIMINATED' }
                      </span>
                    }
                  </h3>
                  
                </Container>
                <Flexbox center>
                  <Flexbox>
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
                </Flexbox>
              </Flexbox>
           </Flexbox >
          )
        })
      }
    </Flexbox>
  )
}

export default OpponentsTop