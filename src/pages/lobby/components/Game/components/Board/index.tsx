import { FunctionComponent } from "react";
import Spoon from "src/assets/spoon";
import Button from "src/shared/components/Button";
import Flexbox from "src/shared/layout/Flexbox";
import { Player, SpoonStatus } from "src/types";

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
  spoonStatuses: SpoonStatus[],
  peekingOn: boolean,
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
  const spoonsArray = props.spoonStatuses
  const width = props.width
  const peekingOn = props.peekingOn

  let spoonHeight = 75
  let spoonWidth = 50
  if (width <= 850) {
    spoonHeight = 50
    spoonWidth = 35
  }

  const spoons = () => {
    return (spoonsArray.map((collected, index) => {
      if (typeof collected === 'boolean' ) {
        if (collected) {
          return (
            <Flexbox key={`spoon-${index}`} column>
              <div style={{ height: spoonHeight, width: spoonWidth}}/>
            </Flexbox> 
          )
        } else {
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
            </Flexbox> 
          )
        }
      } else {
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

  let roundWinner;
  let roundLoser;
  let finalPlayers;
  if (roundComplete && currentPlayers.filter(p => p.gameState.roundWinner).length > 0 && currentPlayers.filter(p => p.gameState.toBeEliminated).length > 0) {
    roundWinner = currentPlayers.filter(p => p.gameState.roundWinner)[0].nickname
    roundLoser = currentPlayers.filter(p => p.gameState.toBeEliminated)[0].nickname
    if (currentRound === numRounds - 1) {
      finalPlayers = currentPlayers.filter(p => p.gameState.remaining && !p.gameState.toBeEliminated)
    }

  }
  

  return (
    <div style={{ minHeight: `${spoonHeight+85}px`, width: '100%', height: `${currentPlayers.filter(p => p.gameState.remaining).length - 1 < 3 ? spoonHeight+85: ''}px`}}>
      <Flexbox column center stretch> 
        {/* ----- DURING ROUND */}
        { !roundComplete && 
          <>
            {/* ---------- DURING PEEK */}
            {(peekTimerOn || myPlayer.gameState.spoonCollected || spectating || !peekingOn) && 
              (<>
                { !(myPlayer.gameState.spoonCollected || spectating || !peekingOn) && 
                  <Flexbox center> 
                    <h2 style={{ marginBottom: '10px'}}>Timer: {seconds}</h2>
                  </Flexbox>
                }
                { props.fourOfAKind() &&
                  <Flexbox center>
                    <h2 className={styles.collectIndicator} style={{ textAlign: 'center'}}> COLLECT NOW! </h2>
                  </Flexbox>
                }
                <div style={{height: '85px'}}>
                  <Flexbox spaceEvenly noWrap={width > 850}> 
                    {spoons()}
                  </Flexbox>
                </div>
              </>)
            }
            {/* ---------- PEEK BUTTON */}
            {!(peekTimerOn || myPlayer.gameState.spoonCollected || spectating || !peekingOn) && 
              <> 
                {currentRound === numRounds && 
                  <>
                    <Flexbox center>
                      <h2 className={styles.collectIndicator} style={{ textAlign: 'center'}}> {props.fourOfAKind() && 'COLLECT NOW!'} </h2>
                    </Flexbox>
                    <div style={{height: '85px'}}>
                      <Flexbox center> 
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
                          <Flexbox spaceEvenly noWrap={width > 850}> 
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
                    <h1 style={{ textAlign: 'center'}}>{roundWinner} WINS THE GAME!</h1> 
                  </Flexbox>
                  <br/>
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
                    { currentRound < numRounds - 1 &&
                      <Flexbox column>
                        <h1 style={{ textAlign: 'center'}}> {roundWinner} wins! </h1>
                        <h3 style={{ textAlign: 'center'}}> {roundLoser} is out! </h3>
                        <h3 style={{ textAlign: 'center'}}> {numRounds - currentRound + 1} players remain. </h3>
                      </Flexbox>
                    }
                    { currentRound === numRounds - 1 && 
                      <Flexbox column> 
                        <h1 style={{ textAlign: 'center'}}> {finalPlayers && finalPlayers[0].nickname} vs. {finalPlayers && finalPlayers[1].nickname} in the FINALE! </h1>
                        <h3 style={{ textAlign: 'center'}}> {roundLoser} is out! </h3>
                      </Flexbox>
                    }
                  </Flexbox>
                  <br/>
                  <Flexbox center>
                    <Button
                      onClick={props.nextRound}
                      disabled={false}
                      primary
                    > 
                      Start next round
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
                <h1 style={{ textAlign: 'center'}}>{roundWinner} WINS THE GAME!</h1> 
                <h3 style={{ textAlign: 'center'}}> Waiting for host to go back to lobby... </h3>
              </Flexbox>
            }
            {currentRound < numRounds && 
              <Flexbox center>
                { currentRound < numRounds - 1 &&
                  <Flexbox column>
                    <h1 style={{ textAlign: 'center'}}> {roundWinner} wins! </h1>
                    <h3 style={{ textAlign: 'center'}}> {roundLoser} is out! </h3>
                    <h3 style={{ textAlign: 'center'}}> {numRounds - currentRound + 1} players remain. </h3>
                    <h3 style={{ textAlign: 'center'}}> Waiting for host... </h3>
                  </Flexbox>
                }
                { currentRound === numRounds - 1 && 
                  <Flexbox column> 
                    <h1 style={{ textAlign: 'center'}}> {finalPlayers && finalPlayers[0].nickname} vs. {finalPlayers && finalPlayers[1].nickname} in the FINALE! </h1>
                    <h3 style={{ textAlign: 'center'}}> {roundLoser} is out! </h3>
                    <h3 style={{ textAlign: 'center'}}> Waiting for host... </h3>
                  </Flexbox>
                }
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