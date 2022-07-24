import { FunctionComponent } from "react";
import Spoon from "src/assets/spoon";
import Avatar from "src/shared/components/Avatar";
import Button from "src/shared/components/Button";
import { Stack } from "@mui/material";
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
  width: number,
  opponents: Player[],
  clicksToCollect: number
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
  const clicksToCollect = props.clicksToCollect

  let spoonHeight = 75
  let spoonWidth = 50
  let avatarSize = 10
  if (width <= 850) {
    spoonHeight = 50
    spoonWidth = 35
    avatarSize = 7
  }

  const spoons = () => {
    return (spoonsArray.map((collected, index) => {
      if (typeof collected === 'boolean' ) {
        if (collected) {
          return <div key={`spoon-${index}`} style={{ height: spoonHeight, width: spoonWidth}}/>
        } else {
          return (
            <button 
              key={`spoon-${index}`}
              onClick={e => props.collectSpoon(index)} 
              className={styles.spoon} 
              disabled={!spoonCollectAllowed(index) || roundComplete || spectating}
            > 
              <Spoon 
                height={spoonHeight} 
                width={spoonWidth}
              /> 
            </button>
          )
        }
      } else {

        const opponentsInBattleIds: string[] = []

        collected.forEach((id) => {
          if (id !== myPlayer.id) {
            if (opponentsInBattleIds.filter(_id => _id === id).length === 0) {
              opponentsInBattleIds.push(id)
            }
          }
        })

        return (
          <Stack key={`spoon-${index}`}>
            <Stack>
              { opponentsInBattleIds.map(id => {
                return <Stack direction="row" key={`spoon-battle-indicator-opponent-${id}`}>
                  { collected.map((_id: string) => {
                      if (_id === id) {
                        const opponent = currentPlayers.filter(p => p.id === _id)[0]
                        return <Avatar number={opponent.avatar} size={avatarSize}/>
                      }
                      return null
                    })
                  }
                </Stack>
              })}
            </Stack>
            <button 
              onClick={e => props.collectSpoon(index)} 
              className={styles.spoon} 
              disabled={!spoonCollectAllowed(index) || roundComplete || spectating}
            > 
              <Spoon 
                height={spoonHeight} 
                width={spoonWidth}
              /> 
            </button>
            <Stack>
              { collected.map((id: string) => {
                  if (id === myPlayer.id) return <Avatar number={myPlayer.avatar} size={avatarSize}/>
                  return null
                })
              }
            </Stack>
          </Stack> 
        )
      }
    }))
  }

  const spoonCollectAllowed = (index: number | null) => {

    if (index) {
      if (currentRound === numRounds) {
        if (typeof spoonsArray[index] !== 'boolean') {
          if (!props.fourOfAKind()) return true
        }
      }
    } 

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

  const getHeight = () => {
    if (width > 850) return 215
    return 160
  }
  

  return (
    <div 
      style={{ 
        minHeight: `${spoonHeight+85}px`, width: '100%', 
        height: `${currentPlayers.filter(p => p.gameState.remaining).length - 1 < 3 ? spoonHeight+85 : getHeight()}px`
      }}
    >
      <Stack direction="column" flexWrap="nowrap"> 
        {/* ----- DURING ROUND */}
        { !roundComplete && 
          <>
            {/* ---------- DURING PEEK */}
            {(peekTimerOn || myPlayer.gameState.spoonCollected || spectating || !peekingOn) && 
              (<>
                <div style={{ height: '60px'}}>
                { !(myPlayer.gameState.spoonCollected || spectating || !peekingOn) && 
                  <Stack direction="row" justifyContent="center"> 
                    <h2 style={{ marginBottom: '10px'}}>Timer: {seconds}</h2>
                  </Stack>
                }
                { (props.fourOfAKind() && !spoonCollectAllowed(null)) &&
                  <Stack direction="row" justifyContent="center">
                    <h2 className={styles.collectIndicator} style={{ textAlign: 'center'}}> COLLECT NOW! </h2>
                  </Stack>
                }
                </div>
                <div style={{height: '85px'}}>
                  <Stack direction="row" justifyContent="space-evenly" flexWrap="nowrap"> 
                    {spoons()}
                  </Stack>
                </div>
              </>)
            }
            {/* ---------- PEEK BUTTON */}
            {!(peekTimerOn || myPlayer.gameState.spoonCollected || spectating || !peekingOn) && 
              <> 
                {currentRound === numRounds && 
                  <>
                    <div style={{ height: '60px'}}>
                    <Stack direction="row" justifyContent="center">
                      <h2 className={styles.collectIndicator} style={{ textAlign: 'center'}}> {props.fourOfAKind() && 'COLLECT NOW!'} </h2>
                    </Stack>
                    </div>
                    <div style={{height: '85px'}}>
                      <Stack direction="row" justifyContent="center"> 
                        {spoons()}
                      </Stack>
                    </div>
                  </>
                }
                {currentRound < numRounds &&
                  <>
                    { props.fourOfAKind() &&
                      <>
                        <div style={{ height: '60px'}}>
                        <Stack direction="row" justifyContent="center">
                          <h2 className={styles.collectIndicator} style={{ textAlign: 'center'}}> COLLECT NOW! </h2>
                        </Stack>
                        </div>
                        <div style={{height: '85px'}}>
                          <Stack direction="row" justifyContent="space-evenly" flexWrap="wrap"> 
                            {spoons()}
                          </Stack>
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
                  <Stack direction="row" justifyContent="center">
                    <h1 style={{ textAlign: 'center'}}>{roundWinner} WINS THE GAME!</h1> 
                  </Stack>
                </>
              }
              {/* ------- NEXT ROUND */}
              {currentRound < numRounds &&
                <Stack direction="row" justifyContent="center">
                  { currentRound < numRounds - 1 &&
                    <Stack>
                      <h1 style={{ textAlign: 'center'}}> {roundWinner} wins! </h1>
                      <h3 style={{ textAlign: 'center'}}> {roundLoser} is out! </h3>
                      <h3 style={{ textAlign: 'center'}}> {numRounds - currentRound + 1} players remain. </h3>
                    </Stack>
                  }
                  { currentRound === numRounds - 1 && 
                    <Stack> 
                      <h1 style={{ textAlign: 'center'}}> {finalPlayers && finalPlayers[0].nickname} vs. {finalPlayers && finalPlayers[1].nickname} in the FINALE! </h1>
                      <h3 style={{ textAlign: 'center'}}> {roundLoser} is out! </h3>
                    </Stack>
                  }
                </Stack>
              }
            </>
          }
          {/* ------- LOBBY WAITING MESSAGES */}
          {!currentMyPlayer.isHost && 
            <>
            {currentRound === numRounds && 
              <Stack> 
                <h1 style={{ textAlign: 'center'}}>{roundWinner} WINS THE GAME!</h1> 
                <h3 style={{ textAlign: 'center'}}> Waiting for host to go back to lobby... </h3>
              </Stack>
            }
            {currentRound < numRounds && 
              <Stack direction="row" justifyContent="center">
                { currentRound < numRounds - 1 &&
                  <Stack>
                    <h1 style={{ textAlign: 'center'}}> {roundWinner} wins! </h1>
                    <h3 style={{ textAlign: 'center'}}> {roundLoser} is out! </h3>
                    <h3 style={{ textAlign: 'center'}}> {numRounds - currentRound + 1} players remain. </h3>
                    <h3 style={{ textAlign: 'center'}}> Waiting for host... </h3>
                  </Stack>
                }
                { currentRound === numRounds - 1 && 
                  <Stack> 
                    <h1 style={{ textAlign: 'center'}}> {finalPlayers && finalPlayers[0].nickname} vs. {finalPlayers && finalPlayers[1].nickname} in the FINALE! </h1>
                    <h3 style={{ textAlign: 'center'}}> {roundLoser} is out! </h3>
                    <h3 style={{ textAlign: 'center'}}> Waiting for host... </h3>
                  </Stack>
                }
              </Stack>
            }
            </>
          }
        </>
      }
      </Stack>
    </div>
  )
}

export default Board