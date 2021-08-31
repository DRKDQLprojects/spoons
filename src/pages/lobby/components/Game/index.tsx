import { useEffect, useState, useRef } from 'react';
import { LobbyInfo, Player, Card, emptyGameState, emptyPlayer } from 'src/types';
import useInterval from 'react-useinterval';
import firebase from 'src/firebase/client'
import { convertToDBPlayers, setupBoard } from 'src/shared/helpers';

import styles from './Game.module.css'
import Loader from 'src/shared/components/Loader'
import Logo from 'src/shared/components/Logo';
import Flexbox from 'src/shared/layout/Flexbox';
import Grid from 'src/shared/layout/Grid';
import Button from 'src/shared/components/Button';
import PlayerActions from './components/PlayerActions';
import OpponentsTop from './components/Opponents/Top';
import Board from './components/Board';
import OpponentsLeft from './components/Opponents/Left';
import OpponentsRight from './components/Opponents/Right';

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

  const [cardDrawn, setCardDrawn] = useState<Card | undefined>(undefined)
  const [pileLength, setPileLength] = useState<number>(0)
  const [numSpoonsLeft, setNumSpoonsLeft] = useState(0)
  const [safeMessage, setSafeMessage] = useState('') 
  const [roundComplete, setRoundComplete] = useState(false)
  
  const [peekTimerOn, setPeekTimerOn] = useState(false)
  const [peekCooldownOn, setPeekCooldownOn] = useState(false)
  const [seconds, setSeconds] = useState(-1)

  const [loading, setLoading] = useState(true)
  const [spectating, setSpectating] = useState(false)

  useEffect(() => {
    if (currentRound !== 0) {
      mapLobbyToUI()
    } else {
      setLoading(true)
    }
  }, [props])

  const mapLobbyToUI = () => {
    const unorderedRemainingPlayers = currentPlayers.filter(p => p.gameState.remaining)
    const remainingPlayers = orderPlayers(unorderedRemainingPlayers);

    console.log(remainingPlayers)

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

      let pileLength = 0;
      if (currentMyPlayer.gameState.pile) {
        if (cardDrawn) { 
          pileLength = currentMyPlayer.gameState.pile.length - 1 
        } else {
          pileLength = currentMyPlayer.gameState.pile.length
        }
      }
      setPileLength(pileLength)
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
      let pileLength = 0;
      if (spectatingPlayer.gameState.pile) {
        if (cardDrawn) { 
          pileLength = spectatingPlayer.gameState.pile.length - 1 
        } else {
          pileLength = spectatingPlayer.gameState.pile.length
        }
      }
      setPileLength(pileLength)
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

  const collectSpoon = () => {
    const winner = currentPlayers.filter(p => p.gameState.roundWinner).length === 0
    if (winner) {
      firebase.database().ref(`${currentLobby.id}/players/${myPlayer.id}/gameState`).set({
        ...myPlayer.gameState,
        spoonCollected: true,
        roundWinner: true
      })
    } else {
      firebase.database().ref(`${currentLobby.id}/players/${myPlayer.id}/gameState/spoonCollected`).set(true)
    }
  }

  const fourOfAKind = () => {
    const hand = myPlayer.gameState.hand
    const value = hand[0].value
    return hand.filter(c => c.value === value).length === 4
  }

  const discard = (card: Card) => {
    const newHand = myPlayer.gameState.hand.concat([cardDrawn as Card]).filter(c => c !== card)
    
    const nextPlayer = currentPlayers.filter(p => p.id === myPlayer.gameState.nextPlayerId)[0]
    const playersDb = convertToDBPlayers(currentPlayers)

    setCardDrawn(undefined)
    firebase.database().ref(`${currentLobby.id}/players`).set({
      ...playersDb,
      [myPlayer.id]: {
        ...myPlayer,
        id: null,
        gameState: {
          ...myPlayer.gameState,
          hand: newHand,
          pile: myPlayer.gameState.pile.splice(1, myPlayer.gameState.pile.length)
        }
      },
      [nextPlayer.id]: {
        ...nextPlayer,
        gameState: {
          ...nextPlayer.gameState,
          pile: nextPlayer.gameState.pile ? nextPlayer.gameState.pile.concat([card]) : [card]
        }
      }
    })
  }

  const drawFromPile = () => {
    const pile = myPlayer.gameState.pile
    const cardDrawn = pile[0]

    setPileLength(pileLength - 1)
    setCardDrawn(cardDrawn)
  }

  const setupForElimination = () => {
    firebase.database().ref(`${currentLobby.id}/players/${currentMyPlayer.id}/gameState/toBeEliminated`).set(true)
  }

  const nextRound = () => {
    const newPlayers = setupBoard(currentPlayers, currentSettings, currentRound)
    firebase.database().ref(currentLobby.id).set({
      gameStatus: {
        ...currentLobby.gameStatus,
        countdownStarted: true
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
    let pileLength = 0;
    if (nextPlayer.gameState.pile) pileLength = nextPlayer.gameState.pile.length

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
    setPileLength(pileLength)
  }

  const spectatePrevious = () => {
    const remainingPlayers = currentPlayers.filter(p => p.gameState.remaining)

    const previousPlayer = remainingPlayers.filter(p => p.id === myPlayer.gameState.previousPlayerId)[0]
    const previousOpponents = findOpponents(previousPlayer, remainingPlayers)
    let pileLength = 0;

    if (previousPlayer.gameState.pile) pileLength = previousPlayer.gameState.pile.length

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
    setPileLength(pileLength)
  }

  if (loading) return <Loader message="Organsing your table..."/>

  return (
    <> 
      {/* --------------- NAVBAR   */}
      <div className="navbar">
        <Grid 
          gridTemplateColumns="1fr 1fr 1fr"
          gridTemplateRows=""
        >
          <Flexbox column center> 
            { currentMyPlayer.isHost && 
              <div className={styles.backButton}> 
                <Button disabled={false} onClick={() => backToLobby()} primary> LOBBY </Button>  
              </div>
            }
          </Flexbox>
          <Logo text="Spoons"/>
          <Flexbox column center>
            <h1> YOU: {currentMyPlayer.nickname} </h1>
          </Flexbox>
        </Grid>
      </div>
      
      {/* ---------------  GAME */}
      <div className={styles.container}>
        <Grid 
          gridTemplateColumns=""
          gridTemplateRows="1fr 3fr"
        >
          {/* ---------- OPPONENTS IN TOP ROW */}
          <OpponentsTop
            opponents={opponents}
            roundComplete={roundComplete}
          />
          <Grid 
            gridTemplateColumns="1fr 3fr 1fr"
            gridTemplateRows=""
          >
            {/* -------- OPPONENTS ON THE LEFT */}
            <OpponentsLeft
              opponents={opponents}
              roundComplete={roundComplete}
            />
            {/* --------------- PLAYER ACTIONS */}
            <Grid
              gridTemplateColumns=""
              gridTemplateRows="1fr 1fr"
            >
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
                numSpoonsLeft={numSpoonsLeft}
                fourOfAKind={fourOfAKind}
                peek={peek}
                backToLobby={backToLobby}
                nextRound={nextRound}
              />
              <PlayerActions
                myPlayer={myPlayer}
                spectating={spectating}
                cardDrawn={cardDrawn}
                pileLength={pileLength}
                roundComplete={roundComplete}
                safeMessage={safeMessage}
                spectateNext={spectateNext}
                spectatePrevious={spectatePrevious}
                discard={discard}
                fourOfAKind={fourOfAKind}
                drawFromPile={drawFromPile}
              /> 
            </Grid>

            {/* ---------- OPPONENTS ON THE RIGHT */}
            <OpponentsRight
              opponents={opponents}
              roundComplete={roundComplete}
            />
          </Grid>
        </Grid>
      </div>
    </>
  )
}

export default Game;


