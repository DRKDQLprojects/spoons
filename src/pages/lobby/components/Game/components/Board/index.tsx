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
        <button 
          key={`spoon-${i}`} 
          onClick={e => props.collectSpoon()} 
          className={styles.spoon} 
          disabled={!spoonCollectAllowed() || roundComplete || spectating}
        > 
          <Spoon 
            // key={`spoon-${i}`} 
            height={200} 
            width={100} 
            numSpoonsLeft={numSpoonsLeft}
          /> 
        </button>
        
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
          <Flexbox spaceEvenly> 
            {spoons()}
          </Flexbox>
          { (!myPlayer.gameState.spoonCollected && !roundComplete && !spectating) && 
            <div style={{ marginTop: '10px'}}>
              <Button  
                danger
                onClick={props.cancelPeek}
                disabled={false}
              >
                Cancel ({seconds}s)
              </Button> 
            </div>
          }
        </>
      )}
      {/* ---------- PEEK BUTTON */}
      {(!(peekTimerOn || myPlayer.gameState.spoonCollected || roundComplete || spectating)) && (
        <div style={{ height: '100%'}}>
          <Button 
            primary
            onClick={props.peek} 
            disabled={peekCooldownOn || spectating}
          >
            {peekCooldownOn ? `Wait (${seconds}s)` : 'Check for Spoons '}
          </Button> 
        </div>
      )}
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
                    <div style={{height: '60px'}}>
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
                  <div style={{height: '50px', width: '100px'}}>
                    <Button
                      onClick={props.nextRound}
                      disabled={false}
                      primary
                    > 
                      Start
                    </Button>
                  </div>
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