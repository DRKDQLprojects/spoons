import { useEffect, useState, useRef } from 'react';
import { LobbyInfo, Player, Card, emptyGameState, emptyPlayer } from 'src/types';
import useInterval from 'react-useinterval';
import firebase from 'src/firebase/client'
import { convertToDBPlayers, convertToPlayers, setupBoard } from 'src/shared/helpers';

import styles from './Game.module.css'
import Fullscreen from 'src/shared/layout/Fullscreen';
import Loader from 'src/shared/components/Loader'
import Flexbox from 'src/shared/layout/Flexbox';
import OldGrid from 'src/shared/layout/Grid';
import PlayerActions from './components/PlayerActions';
import OpponentsTop from './components/Opponents/Top';
import Board from './components/Board';
import OpponentsLeft from './components/Opponents/Left';
import OpponentsRight from './components/Opponents/Right';

import { Grid } from '@material-ui/core';
import Logo from 'src/shared/components/Logo';
import Button from 'src/shared/components/Button';

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
    const winner = currentPlayers.filter(p => p.gameState.roundWinner).length === 0

    const gameStateRef = firebase.database().ref(`${currentLobby.id}/players/${myPlayer.id}/gameState`)
    firebase.database().ref(`${currentLobby.id}/gameStatus/spoons/${pos}`).transaction((currentValue) => {
      if (currentValue === 0) {
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
        return currentValue + 1
      } else {
        return currentValue
      }
    })
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
    let spoons = []
    for (let i = 0; i < numSpoons; i++) { spoons.push(0) }
    firebase.database().ref(currentLobby.id).set({
      gameStatus: {
        ...currentLobby.gameStatus,
        countdownStarted: true,
        spoons: spoons
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
      gameStatus: {
        round: 0,
        countdownStarted: false
      },
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

  console.log(currentLobby.gameStatus.spoons)

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
          {/* ---------- OPPONENTS IN TOP ROW */}
          <OpponentsTop
            opponents={opponents}
            roundComplete={roundComplete}
            width={width}
          />
          <br/>
          <OldGrid 
            gridTemplateColumns="1fr 3fr 1fr"
            gridTemplateRows=""
          >
            {/* -------- OPPONENTS ON THE LEFT */}
            <OpponentsLeft
              opponents={opponents}
              roundComplete={roundComplete}
              width={width}
            />
            {/* --------------- PLAYER ACTIONS */}
            <Flexbox column noWrap>
              <br/>
              <Board
                peekTimerOn={peekTimerOn}
                myPlayer={myPlayer}
                spectating={spectating}
                roundComplete={roundComplete}
                seconds={seconds}
                currentRound={currentRound}
                currentMyPlayer={currentMyPlayer}
                currentPlayers={currentPlayers}
                peekCooldownOn={peekCooldownOn}
                cancelPeek={cancelPeek}
                collectSpoon={collectSpoon}
                spoons={currentGameStatus.spoons}
                fourOfAKind={fourOfAKind}
                peek={peek}
                backToLobby={backToLobby}
                nextRound={nextRound}
                width={width}
              />
              <br/>
              <PlayerActions
                myPlayer={myPlayer}
                spectating={spectating}
                roundComplete={roundComplete}
                safeMessage={safeMessage}
                spectateNext={spectateNext}
                spectatePrevious={spectatePrevious}
                discard={discard}
                fourOfAKind={fourOfAKind}
                drawFromPile={drawFromPile}
              /> 
            </Flexbox>
            {/* ---------- OPPONENTS ON THE RIGHT */}
            <OpponentsRight
              opponents={opponents}
              roundComplete={roundComplete}
              width={width}
            />
          </OldGrid>
        </Flexbox>
        </div>
    </Fullscreen>
  )
}

export default Game;


