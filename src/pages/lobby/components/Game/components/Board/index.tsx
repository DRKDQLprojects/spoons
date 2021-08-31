import { FunctionComponent } from "react";
import Spoon from "src/assets/spoon";
import Button from "src/shared/components/Button";
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
  currentMyPlayer: Player,
  currentPlayers: Player[],
  peekCooldownOn: boolean,
  numSpoonsLeft: number,
  cancelPeek: () => void,
  collectSpoon: () => void,
  fourOfAKind: () => boolean,
  peek: () => void,
  backToLobby: () => void,
  nextRound: () => void

}

const Board: FunctionComponent<BoardProps> = (props) => {

  const peekTimerOn = props.peekTimerOn
  const myPlayer = props.myPlayer
  const spectating = props.spectating
  const roundComplete = props.roundComplete
  const seconds = props.seconds
  const currentRound = props.currentRound
  const currentMyPlayer = props.currentMyPlayer
  const currentPlayers = props.currentPlayers
  const peekCooldownOn = props.peekCooldownOn
  const numSpoonsLeft = props.numSpoonsLeft

  const spoons = () => {
    let list = []
    for (let i = 0; i < numSpoonsLeft; i++) {
      list.push(i)
    }
    return (list.map((i) => {
      return (
        <Flexbox key={`spoon-${i}`} column>
        <button 
          onClick={e => props.collectSpoon()} 
          className={styles.spoon} 
          disabled={!spoonCollectAllowed() || roundComplete || spectating}
        > 
          <Spoon 
            height={75} 
            width={50} 
            numSpoonsLeft={numSpoonsLeft}
          /> 
        </button>
        <h3 className={styles.spoonCollectedLabel}> Collect </h3>
        </Flexbox>
        
      )
    }))
  }

  const spoonCollectAllowed = () => {
    
    const firstSpoonCollected = currentPlayers.filter(p => p.gameState.spoonCollected).length >= 1
    const myPlayerCollected = myPlayer.gameState.spoonCollected

    return !myPlayerCollected && (firstSpoonCollected || props.fourOfAKind())
  }

  return (
    <Flexbox column center>
      {/* ---------- CANCEL PEEK */}
      {(peekTimerOn || myPlayer.gameState.spoonCollected || spectating) && (
        <>
          { (!myPlayer.gameState.spoonCollected && !roundComplete && !spectating) && 
            <h2>{seconds}</h2>
          }
          <Flexbox spaceEvenly> 
            {spoons()}
          </Flexbox>
        </>
      )}
      {/* ---------- PEEK BUTTON */}
      {(!(peekTimerOn || myPlayer.gameState.spoonCollected || roundComplete || spectating)) && 
        <> 
          {currentRound === currentPlayers.length - 1 && 
            <Flexbox column center>
              <h2 className={styles.collectIndicator}> {props.fourOfAKind() && 'COLLECT NOW!'} </h2>
              <Flexbox spaceEvenly> 
                {spoons()}
              </Flexbox>
            </Flexbox>
          }

          {currentRound < currentPlayers.length - 1 &&
            (<div style={{ height: '100%'}}>
              <Button 
                onClick={props.peek} 
                disabled={peekCooldownOn || spectating}
                success={props.fourOfAKind()}
                primary={!props.fourOfAKind()}
              >
                {peekCooldownOn && `Wait (${seconds})`}
                {!peekCooldownOn && props.fourOfAKind() && 'Collect your spoon!'}
                {!peekCooldownOn && !props.fourOfAKind() && 'Check for spoons'}
              </Button> 
            </div>)
          }
        </>
      }
      {/* --------- END OF ROUND */}
      { roundComplete && 
        <Flexbox column center>

          {/* ------- HOST ACTIONS */}
          {currentMyPlayer.isHost &&
            <>
              {/* ------- FINAL ROUND */}
              {currentRound === currentPlayers.length - 1 && 
                <>
                  <h1> Spoons Game Complete! </h1>
                  <Flexbox center>
                    <div style={{height: '65px'}}>
                        <Button
                          onClick={props.backToLobby}
                          disabled={false}
                          primary
                        > 
                          Return to Lobby
                        </Button>
                    </div>
                  </Flexbox>
               </>
              }
              {/* ------- NEXT ROUND */}
              {currentRound < currentPlayers.length - 1 &&
                <>
                  <h1> Ready for Round {currentRound + 1} / {currentPlayers.length - 1}?</h1>
                  <Flexbox center>
                    <div style={{height: '65px', width: '200px'}}>
                      <Button
                        onClick={props.nextRound}
                        disabled={false}
                        primary
                      > 
                        Start
                      </Button>
                    </div>
                  </Flexbox>
                </>
              }
            </>
          }
          {/* ------- LOBBY WAITING MESSAGES */}
          {!currentMyPlayer.isHost && 
            <>
            {currentRound === currentPlayers.length - 1 && 
              <> 
                <h1> Spoons Game Complete! </h1> 
                <h3> Waiting for host to go back to lobby... </h3>
              </>
            }
            {currentRound < currentPlayers.length - 1 && 
              <h1> Waiting for host to move to Round {currentRound + 1}/{currentPlayers.length - 1}... </h1>
            }
            </>
          }
        </Flexbox>
      }
    </Flexbox>
  )
}

export default Board