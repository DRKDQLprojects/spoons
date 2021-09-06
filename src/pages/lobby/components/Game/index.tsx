import { useEffect, useState } from 'react';
import { LobbyInfo, Player, Card, emptyGameState, emptyPlayer, emptyGameStatus } from 'src/types';
import useInterval from 'react-useinterval';
import firebase from 'src/firebase/client'
import { convertToDBPlayers, convertToPlayers, getMaxPileLength, playersToRender, setupBoard } from 'src/shared/helpers';

import styles from './Game.module.css'
import Fullscreen from 'src/shared/layout/Fullscreen';
import Loader from 'src/shared/components/Loader'
import Flexbox from 'src/shared/layout/Flexbox';
import OldGrid from 'src/shared/layout/Grid';

import Board from './components/Board';
import PlayerTop from './components/Player/Top';
import PlayerLeft from './components/Player/Left';
import PlayerRight from './components/Player/Right';

import MyPlayer from './components/MyPlayer';

import Button from 'src/shared/components/Button';
import PlayerBottom from './components/Player/Bottom';

type GameProps = {
  lobby: LobbyInfo,
  myPlayer: Player
}

const Game = (props: GameProps) => {

  const currentLobby = props.lobby
  const currentGameStatus = currentLobby.gameStatus
  const currentRound = currentGameStatus.round
  const currentPlayers = currentLobby.players
  const currentSettings = currentLobby.settings

  const currentMyPlayer = props.myPlayer

  const [myPlayer, setMyPlayer] = useState<Player>(emptyPlayer)
  const [opponents, setOpponents] = useState<Player[]>([])

  const [numSpoonsLeft, setNumSpoonsLeft] = useState(0)
  const [safeMessage, setSafeMessage] = useState('') 
  const [roundComplete, setRoundComplete] = useState(false)
  
  const [peekTimerOn, setPeekTimerOn] = useState(false)
  const [peekCooldownOn, setPeekCooldownOn] = useState(false)
  const [seconds, setSeconds] = useState(-1)

  const [loading, setLoading] = useState(true)
  const [spectating, setSpectating] = useState(false)

  const [width, setWidth] = useState(-1)
  const [scale, setScale] = useState<string>('1')

  useEffect(() => {
    if (currentRound !== 0) {
      mapLobbyToUI()
      setWidth(window.screen.width)
      window.addEventListener('resize', calculateScale)
      return (() => window.removeEventListener('resize', calculateScale))
    } else {
      setLoading(true)
    }
  }, [props])

  const calculateScale = () => {
    const height = window.screen.height
    const width = window.screen.width

    const baseHeight = 715
    const baseWidth = 1100

    setScale(`${(850 < width && width < baseWidth) ? (width / baseWidth) : 1 }, ${height < baseHeight ? (height / baseHeight) : 1}`)
    setWidth(window.screen.width)
  }

  const mapLobbyToUI = () => {
    const unorderedRemainingPlayers = currentPlayers.filter(p => p.gameState.remaining)
    const remainingPlayers = orderPlayers(unorderedRemainingPlayers);

    const numSpoonsLeft = remainingPlayers.filter(p => !p.gameState.spoonCollected).length - 1

    if (currentMyPlayer.gameState.remaining) {
      const opponents = findOpponents(currentMyPlayer, remainingPlayers)
      if (currentMyPlayer.gameState.spoonCollected) {
        if (currentMyPlayer.gameState.roundWinner) {
          setSafeMessage('WINNER')
        } else {
          setSafeMessage('SAFE')
        }
        if (numSpoonsLeft === 0) {
          setRoundComplete(true)
        }
      } else {
        if (numSpoonsLeft === 0) {
          setupForElimination()
          setSafeMessage('ELIMINATED')
          setRoundComplete(true)   
        }
      }
      setMyPlayer(currentMyPlayer)
      setOpponents(opponents)
    } else {
      let spectatingPlayer : Player;
      let spectatingOpponents : Player[]
      if (!spectating) {
        spectatingPlayer = remainingPlayers[Math.floor(Math.random() * remainingPlayers.length)]
        spectatingOpponents = findOpponents(spectatingPlayer, remainingPlayers)
        setSpectating(true)
      } else {
        spectatingPlayer = remainingPlayers.filter(p => p.id === myPlayer.id)[0]
        spectatingOpponents = findOpponents(spectatingPlayer, remainingPlayers)
      }
      if (spectatingPlayer.gameState.spoonCollected) {
        if (myPlayer.gameState.roundWinner) {
          setSafeMessage('WINNER')
        } else {
          setSafeMessage('SAFE')
        }
        if (numSpoonsLeft === 0) {
          setRoundComplete(true)
        }
      } else {
        if (numSpoonsLeft === 0) {
          setupForElimination()
          setSafeMessage('ELIMINATED')
          setRoundComplete(true)   
        }
      }
      setMyPlayer(spectatingPlayer)
      setOpponents(spectatingOpponents)
    }
    setNumSpoonsLeft(numSpoonsLeft)
    setLoading(false)
  }

  useInterval(() => {
    if (peekTimerOn) {
      if (currentSettings.peek.timer >= seconds && seconds > 1) {
        setSeconds(seconds - 1)
      } else {
        cancelPeek()
      }
    } 
    if (peekCooldownOn) {
      if (currentSettings.peek.cooldown >= seconds && seconds > 1) {
        setSeconds(seconds - 1)
      } else {
        setSeconds(-1)
        setPeekTimerOn(false)
        setPeekCooldownOn(false)
      }
    }
    
  }, (peekCooldownOn || peekTimerOn) ? 1000 : null)

  const peek = () => {
    setPeekTimerOn(true)
    setSeconds(currentSettings.peek.timer)
  }

  const cancelPeek = () => {
    setSeconds(currentSettings.peek.cooldown)
    setPeekTimerOn(false)
    setPeekCooldownOn(true)
  }

  const findOpponents = (player: Player, players: Player[]): Player[] => {
    const playerPos = players.findIndex((p) => p.id === player.id)
    const before = players.slice(0, playerPos)
    const after = players.slice(playerPos + 1, players.length)
    return after.concat(before)
  }

  const orderPlayers = (players: Player[]) => {
    const firstPlayer = players[0]
    const ordered: Player[] = [];

    let currPlayerId: string = firstPlayer.id;

    while (currPlayerId !== '') {
      const player = players.filter(p => p.id === currPlayerId)[0]
      ordered.push(player)
      if (currPlayerId === firstPlayer.gameState.previousPlayerId) {
        currPlayerId = ''
      } else {
        currPlayerId = player.gameState.nextPlayerId
      }
    }


    return ordered;
  }

  const collectSpoon = (pos: number) => {
    
    const gameStateRef = firebase.database().ref(`${currentLobby.id}/players/${myPlayer.id}/gameState`)
    const clicksToCollect = currentSettings.clicksToCollect

    // Default
    if (clicksToCollect === 1) {
      const spoonStatusesPosRef = firebase.database().ref(`${currentLobby.id}/gameStatus/spoonStatuses/${pos}`)

      spoonStatusesPosRef.transaction((currentValue) => {
        const winner = currentPlayers.filter(p => p.gameState.roundWinner).length === 0   
        if (!currentValue) {
          if (winner) {
            gameStateRef.transaction((currentValue) => {
              if (currentValue)
              return {
                ...currentValue,
                spoonCollected: true,
                roundWinner: true
              }
            })
          } else {
            gameStateRef.transaction((currentValue) => {
              if (currentValue)
              return {
                ...currentValue,
                spoonCollected: true,
              }
            })
          }
          return true
        }
      })
    } 
    // Tug of war
    else {
      const spoonStatusesRef = firebase.database().ref(`${currentLobby.id}/gameStatus/spoonStatuses`)
      spoonStatusesRef.transaction((currentValue) => {
        // TODO:

        // IF WINNER - set the currentValue[pos] = true

        // ELSE - push myPlayer.id into currentValue[pos] 
        // + get rid of instances of myPlayer.id in other positions
        // + if myPlayer.id !in currentValue[pos], set all other players in there to 1

        // IF count of myPlayer.id in currentValue[pos] === clicksToCollect, set spoonCollected = true, currentValue[pos] = true
        return currentValue
      })
    }
    
  }

  const fourOfAKind = () => {
    const hand = myPlayer.gameState.hand
    const value = hand[0].value
    return hand.filter(c => c.value === value).length === 4
  }

  const discard = (card: Card) => {    
    firebase.database().ref(`${currentLobby.id}/players/${myPlayer.id}/gameState`).transaction((currentValue) => {
      const newHand = currentValue.hand.map((c: any) => {
        if (c.value === card.value && c.suit === card.suit) return myPlayer.gameState.cardDrawn
        return c
      })
      return {
        ...currentValue,
        hand: currentValue.hand ? newHand : currentValue.hand,
        cardDrawn: currentValue.cardDrawn ? null : currentValue.cardDrawn
      }
    })

    firebase.database().ref(`${currentLobby.id}/players/${myPlayer.gameState.nextPlayerId}/gameState`).transaction((currentValue) => {
      return  {
        ...currentValue,
        pile: currentValue.pile ? currentValue.pile.concat([card]) : [card]
      }
    })
  }

  const drawFromPile = () => {
    firebase.database().ref(`${currentLobby.id}/players/${currentMyPlayer.id}/gameState/`).transaction((currentValue) => {
      return {
        ...currentValue,
        cardDrawn: currentValue.cardDrawn ? null : currentValue.pile[0],
        pile: currentValue.pile ? currentValue.pile.splice(1, currentValue.pile.length) : null
      }
    })
  }

  const setupForElimination = () => {
    firebase.database().ref(`${currentLobby.id}/players/${currentMyPlayer.id}/gameState/toBeEliminated`).set(true)
  }

  const nextRound = () => {
    const newPlayers = setupBoard(currentPlayers, currentSettings, currentRound)
    const numSpoons = convertToPlayers(newPlayers).filter(p => p.gameState.remaining).length - 1

    let spoonStatuses = []
    for (let i = 0; i < numSpoons; i++) { spoonStatuses.push(false) }
    firebase.database().ref(currentLobby.id).set({
      gameStatus: {
        ...currentLobby.gameStatus,
        countdownStarted: true,
        spoonStatuses: spoonStatuses
      },
      players: newPlayers,
      settings: currentSettings
    })
  }

  const backToLobby = () => {
    const playersWithEmptyGameStates = currentPlayers.map(p => {
      return {
        ...p,
        gameState: emptyGameState
      }
    })
    const dbPlayers = convertToDBPlayers(playersWithEmptyGameStates)
    
    firebase.database().ref(currentLobby.id).set({
      ...currentLobby,
      id: null,
      gameStatus: emptyGameStatus,
      players: dbPlayers
    })
  }

  const spectateNext = () => {
    const remainingPlayers = currentPlayers.filter(p => p.gameState.remaining)

    const nextPlayer = remainingPlayers.filter(p => p.id === myPlayer.gameState.nextPlayerId)[0]
    const nextOpponents = findOpponents(nextPlayer, remainingPlayers)

    if (nextPlayer.gameState.spoonCollected) {
      if (nextPlayer.gameState.roundWinner) {
        setSafeMessage('WINNER')
      } else {
        setSafeMessage('SAFE')
      }
      if (numSpoonsLeft === 0) {
        setRoundComplete(true)
      }
    } else {
      if (numSpoonsLeft === 0) {
        setSafeMessage('ELIMINATED')
        setRoundComplete(true)   
      }
    }

    setMyPlayer(nextPlayer)
    setOpponents(nextOpponents)
  }

  const spectatePrevious = () => {
    const remainingPlayers = currentPlayers.filter(p => p.gameState.remaining)

    const previousPlayer = remainingPlayers.filter(p => p.id === myPlayer.gameState.previousPlayerId)[0]
    const previousOpponents = findOpponents(previousPlayer, remainingPlayers)

    if (previousPlayer.gameState.spoonCollected) {
      if (previousPlayer.gameState.roundWinner) {
        setSafeMessage('WINNER')
      } else {
        setSafeMessage('SAFE')
      }
      if (numSpoonsLeft === 0) {
        setRoundComplete(true)
      }
    } else {
      if (numSpoonsLeft === 0) {
        setSafeMessage('ELIMINATED')
        setRoundComplete(true)   
      } else {
        setSafeMessage('')
      }
    }

    setMyPlayer(previousPlayer)
    setOpponents(previousOpponents)
  }

  
  if (loading) return <Loader message="Organsing your table..."/>

  return (
    <Fullscreen>
      {/* --------------- NAVBAR   */}
      { currentMyPlayer.isHost && 
        <>
        <div className={styles.backButton}> 
          <Button disabled={false} onClick={() => backToLobby()} primary> LOBBY </Button>  
        </div>
        <br/>
        </>
      }
        
      {/* ---------------  GAME */}
      <div className={styles.container} style={{ transform: `scale(${scale})`, transformOrigin: 'top'}}>
        <Flexbox column spaceEvenly>
          {/* ---------- TOP PLAYERS*/}

          <Flexbox spaceEvenly noWrap> 
            {playersToRender(opponents, 'top').map((player, i) => {
              return (
                <>
                  {(i > 0 && opponents.length !== 1) &&  <div style={{ marginLeft: '10px'}}/>}
                  <PlayerTop
                    key={`player-${player.id}`}
                    player={player}
                    roundComplete={roundComplete}
                    width={width}
                    maxPileLength={getMaxPileLength(opponents.length + 1)}
                  />
                </>
              )
            })}
          </Flexbox>

          <OldGrid 
            gridTemplateColumns={opponents.length > 2 ? "1fr 4fr 1fr" : "4fr"}
            gridTemplateRows=""
          >
            {/* -------- LEFT PLAYERS*/}
            { opponents.length > 2 &&
              <PlayerLeft
                player={playersToRender(opponents, 'left')[0]}
                roundComplete={roundComplete}
                width={width}
                maxPileLength={getMaxPileLength(opponents.length + 1)}
              />
            }
            {/* --------------- BOARD */}
            <Board
              peekTimerOn={peekTimerOn}
              myPlayer={myPlayer}
              spectating={spectating}
              roundComplete={roundComplete}
              seconds={seconds}
              currentRound={currentRound}
              numRounds={currentGameStatus.numRounds}
              currentMyPlayer={currentMyPlayer}
              currentPlayers={currentPlayers}
              peekCooldownOn={peekCooldownOn}
              peekingOn={currentSettings.peek.on}
              cancelPeek={cancelPeek}
              collectSpoon={collectSpoon}
              spoonStatuses={currentGameStatus.spoonStatuses}
              fourOfAKind={fourOfAKind}
              peek={peek}
              backToLobby={backToLobby}
              nextRound={nextRound}
              width={width}
              opponents={opponents}
            />
            {/* ---------- RIGHT PLAYERS*/}
            { opponents.length > 2 &&
              <PlayerRight
                player={playersToRender(opponents, 'right')[0]}
                roundComplete={roundComplete}
                width={width}
                maxPileLength={getMaxPileLength(opponents.length + 1)}
              />
            }
          </OldGrid>
          <Flexbox center spaceEvenly noWrap>
            { opponents.length >= 8 &&
              <PlayerBottom
                player={opponents[0]}
                roundComplete={roundComplete}
                width={width}
                maxPileLength={getMaxPileLength(opponents.length + 1)}
              />
            }
            <MyPlayer
              myPlayer={myPlayer}
              spectating={spectating}
              roundComplete={roundComplete}
              safeMessage={safeMessage}
              numOfRemainingPlayers={currentPlayers.filter(p => p.gameState.remaining).length}
              spectateNext={spectateNext}
              spectatePrevious={spectatePrevious}
              discard={discard}
              fourOfAKind={fourOfAKind}
              drawFromPile={drawFromPile}
              width={width}
            /> 
            { opponents.length === 9 &&
              <PlayerBottom
                player={opponents[8]}
                roundComplete={roundComplete}
                width={width}
                maxPileLength={getMaxPileLength(opponents.length + 1)}
              />
            }
          </Flexbox>
        </Flexbox>
        </div>
    </Fullscreen>
  )
}

export default Game;


