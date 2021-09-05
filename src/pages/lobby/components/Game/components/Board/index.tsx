import { FunctionComponent } from "react";
import Spoon from "src/assets/spoon";
import Button from "src/shared/components/Button";
import Container from "src/shared/layout/Container";
import Flexbox from "src/shared/layout/Flexbox";
import { Player } from "src/types";

import styles from './Board.module.css'

type BoardProps = {
  peekTimerOn: boolean,
  myPlayer: Player,
  spectating: boolean,
  roundComplete: boolean,
  seconds: number,
  currentRound: number,
  numRounds: number,
  currentMyPlayer: Player,
  currentPlayers: Player[],
  peekCooldownOn: boolean,
  spoons: number[],
  cancelPeek: () => void,
  collectSpoon: (pos: number) => void,
  fourOfAKind: () => boolean,
  peek: () => void,
  backToLobby: () => void,
  nextRound: () => void,
  width: number

}

const Board: FunctionComponent<BoardProps> = (props) => {

  const peekTimerOn = props.peekTimerOn
  const myPlayer = props.myPlayer
  const spectating = props.spectating
  const roundComplete = props.roundComplete
  const seconds = props.seconds
  const currentRound = props.currentRound
  const numRounds = props.numRounds
  const currentMyPlayer = props.currentMyPlayer
  const currentPlayers = props.currentPlayers
  const peekCooldownOn = props.peekCooldownOn
  const spoonsArray = props.spoons
  const width = props.width

  const spoons = () => {
    let spoonHeight = 75
    let spoonWidth = 50
    if (width <= 850) {
      spoonHeight = 50
      spoonWidth = 35
    }
    return (spoonsArray.map((collected, index) => {
      if (collected === 0) {
        return (
          <Flexbox key={`spoon-${index}`} column>
            <button 
              onClick={e => props.collectSpoon(index)} 
              className={styles.spoon} 
              disabled={!spoonCollectAllowed() || roundComplete || spectating}
            > 
              <Spoon 
                height={spoonHeight} 
                width={spoonWidth}
              /> 
            </button>
            <h3 className={styles.spoonCollectedLabel}> Collect </h3>
          </Flexbox> 
        )
      } else {
        return (
          <Flexbox key={`spoon-${index}`} column>
            <div style={{ height: spoonHeight, width: spoonWidth}}/>
          </Flexbox> 
        )
      }
    }))
  }

  const spoonCollectAllowed = () => {
    
    const firstSpoonCollected = currentPlayers.filter(p => p.gameState.spoonCollected).length >= 1
    const myPlayerCollected = myPlayer.gameState.spoonCollected

    return !myPlayerCollected && (firstSpoonCollected || props.fourOfAKind())
  }

  const getHeight = () => {
    const numSpoonsLeft = spoonsArray.length
    if (numSpoonsLeft < 3) {
      return 200
    } else if (numSpoonsLeft >= 3 && numSpoonsLeft < 6) {
      return 200
    } else if (numSpoonsLeft >= 6 && numSpoonsLeft < 8) {
      return 300
    } else {
      if (width > 850) return 300
      return 600
    }
  }

  return (
    <div className={styles.container} style={{ height: `${getHeight()}px`}}>
      <Flexbox column center> 
        {/* ----- DURING ROUND */}
        { !roundComplete && 
          <>
            {/* ---------- DURING PEEK */}
            {(peekTimerOn || myPlayer.gameState.spoonCollected || spectating) && 
              (<>
                { !(myPlayer.gameState.spoonCollected || spectating) && 
                  <Flexbox center> 
                    <h2 style={{ marginBottom: '10px'}}>Timer: {seconds}</h2>
                  </Flexbox>
                }
                 <div style={{height: '85px'}}>
                  <Flexbox spaceEvenly noWrap> 
                    {spoons()}
                  </Flexbox>
                </div>
              </>)
            }
            {/* ---------- PEEK BUTTON */}
            {!(peekTimerOn || myPlayer.gameState.spoonCollected || spectating) && 
              <> 
                {currentRound === numRounds && 
                  <>
                    <Flexbox center>
                      <h2 className={styles.collectIndicator} style={{ textAlign: 'center'}}> {props.fourOfAKind() && 'COLLECT NOW!'} </h2>
                    </Flexbox>
                    <div style={{height: '85px'}}>
                      <Flexbox spaceEvenly> 
                        {spoons()}
                      </Flexbox>
                    </div>
                  </>
                }
                {currentRound < numRounds &&
                  <>
                    { props.fourOfAKind() &&
                      <>
                        <Flexbox center>
                          <h2 className={styles.collectIndicator} style={{ textAlign: 'center'}}> {props.fourOfAKind() && 'COLLECT NOW!'} </h2>
                        </Flexbox>
                        <div style={{height: '85px'}}>
                          <Flexbox spaceEvenly> 
                            {spoons()}
                          </Flexbox>
                        </div>
                      </>
                    }
                    { !props.fourOfAKind() && 
                      <>
                        <Button 
                          onClick={props.peek} 
                          disabled={peekCooldownOn || spectating}
                          primary
                          stretch
                        >
                          {peekCooldownOn && `Wait (${seconds})`}
                          {!peekCooldownOn && 'Check for spoons'}
                        </Button> 
                      </>
                    }
                  </>
                }
              </>
            }
          </>
        }
      
        {/* ----- END OF ROUND */}
        { roundComplete && 
          <>
          {/* ------- HOST ACTIONS */}
          {currentMyPlayer.isHost &&
            <>
              {/* ------- FINAL ROUND */}
              {currentRound === numRounds && 
                <>
                  <Flexbox center>
                    <h1 style={{ textAlign: 'center'}}> Spoons Game Complete! </h1>
                  </Flexbox>
                  <Flexbox center>
                    <Button
                      onClick={props.backToLobby}
                      disabled={false}
                      primary
                    > 
                      Return to Lobby
                    </Button>
                  </Flexbox>
                </>
              }
              {/* ------- NEXT ROUND */}
              {currentRound < numRounds &&
                <>
                  <Flexbox center>
                    <h1 style={{ textAlign: 'center'}}>
                      {currentRound < numRounds - 1 ?  `Round ${currentRound} complete. ${numRounds - currentRound} to go!` : `Round ${currentRound} complete. The FINAL ROUND is next!`}
                    </h1>
                  </Flexbox>
                  <Flexbox center>
                    <Button
                      onClick={props.nextRound}
                      disabled={false}
                      primary
                    > 
                      Start
                    </Button>
                  </Flexbox>
                </>
              }
            </>
          }
          {/* ------- LOBBY WAITING MESSAGES */}
          {!currentMyPlayer.isHost && 
            <>
            {currentRound === numRounds && 
              <Flexbox column> 
                <h1 style={{ textAlign: 'center'}}> Spoons Game Complete! </h1> 
                <h3 style={{ textAlign: 'center'}}> Waiting for host to go back to lobby... </h3>
              </Flexbox>
            }
            {currentRound < numRounds && 
              <Flexbox center>
                <h1 style={{ textAlign: 'center'}}> 
                {currentRound < numRounds - 1 ?  `Round ${currentRound} complete. ${numRounds - currentRound} to go! Waiting for host...` : `Round ${currentRound} complete. The FINAL ROUND is next! Waiting for host...`}
                </h1>
              </Flexbox>
            }
            </>
          }
        </>
      }
      </Flexbox>
    </div>
  )
}

export default Board