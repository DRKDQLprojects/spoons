import { useEffect, useState, useRef } from 'react';
import { LobbyInfo, Player, Card, emptyGameState, emptyPlayer } from 'src/types';
import styles from './Game.module.css'
import Loader from 'src/shared/components/Loader'
import useInterval from 'react-useinterval';
import firebase from 'src/firebase/client'
import { convertToDBPlayers, setupBoard } from 'src/shared/helpers';

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
    }
  }, [props])

  const mapLobbyToUI = () => {
    const remainingPlayers = currentPlayers.filter(p => p.gameState.remaining)
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

  const spoons = () => {
    let list = []
    for (let i = 0; i < numSpoonsLeft; i++) {
      list.push(i)
    }
    return (list.map((i) => {
      return (
      <button 
        key={`spoon-${i}`} 
        onClick={e => collectSpoon()} 
        className={styles.spoon} 
        disabled={!spoonCollectAllowed() || roundComplete || spectating}
      > 
        Spoon
      </button>)
    }))
  }

  const fourOfAKind = () => {
    const hand = myPlayer.gameState.hand
    const value = hand[0].value
    return hand.filter(c => c.value === value).length === 4
  }

  const spoonCollectAllowed = () => {
    
    const firstSpoonCollected = currentPlayers.filter(p => p.gameState.spoonCollected).length >= 1
    const myPlayerCollected = myPlayer.gameState.spoonCollected

    return !myPlayerCollected && (firstSpoonCollected || fourOfAKind())
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

  const getSuit = (suit: string) => {
    if (suit === 'club') return '♣'
    if (suit === 'diamond') return '♦'
    if (suit === 'heart') return '♥'
    if (suit === 'spade') return '♠'
    return ''
  }

  const generatePileDisplay = (style: any, pileLength: number) => {
    const opponent = style !== styles.myPlayerPileCard
    const elems = []
    for (let i = 0; i < pileLength; i++) {
      if (!opponent) {
        if (i === pileLength - 1) {
          elems.push(
            <button 
              className={style} 
              style={{marginLeft: `${i+1}px`, marginTop: `${i+1}px`}}
              onClick={drawFromPile}
              disabled={cardDrawn !== undefined || roundComplete || spectating}
            > 
              { spectating ? '' : 'Click To Draw' }
            </button>
            )
        } else {
          elems.push(<div className={style} style={{marginLeft: `${i+1}px`, marginTop: `${i+1}px`}}/>)
        }
      } else {
        elems.push(<div className={style} style={{marginLeft: `${i+1}px`, marginTop: `${i+1}px`}}/>)
      }
    }
    return elems
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
      if (currentRound === currentPlayers.length - 1) {
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
      if (currentRound === currentPlayers.length - 1) {
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

    setMyPlayer(previousPlayer)
    setOpponents(previousOpponents)
    setPileLength(pileLength)
  }

  if (loading) return <Loader message="Organsing your table..."/>

  return (
    <div className={styles.container}> 
      {/* --------------- TITLE   */}
      <div className={styles.title}>
        <h1> Playing Spoons :) </h1> 
       { currentMyPlayer.isHost && <button onClick={e => backToLobby()}> Back to Lobby </button> }
      </div>
      {/* --------------- OPPONENTS   */}
      <div className={styles.opponents}> 
        {opponents.map(p => {
          return (
            <div key={`opponent-${p.id}`} className={styles.opponent}> 
              <h2> {p.nickname} {p.gameState.dealer ? '(Dealer)' : ''}</h2>
              <div className={styles.playerActions}> 
                { p.gameState.pile.length === 0  && <div className={styles.opponentPilePlaceholder}/>}
                { p.gameState.pile.length > 0 && 
                  <div className={styles.opponentPile}> 
                    {generatePileDisplay(styles.opponentPileCard, p.gameState.pile.length)}
                  </div>
                }
                <div className={styles.opponentCards}>
                  {p.gameState.hand.map((_, index) => {
                    return (
                      <div className={styles.opponentCard} key={`opponent-card-${index}`}/> 
                    )
                  })}
                </div>
              </div>
              {roundComplete && 
                <h1 className={p.gameState.spoonCollected ? styles.safe : styles.eliminated}> 
                  {p.gameState.spoonCollected && p.gameState.roundWinner && 'WINNER' }
                  {p.gameState.spoonCollected && !p.gameState.roundWinner && 'SAFE' }
                  {!p.gameState.spoonCollected && 'ELIMINATED' }
                </h1>
              }
            </div>
          )
        })}
      </div>
      {/* --------------- TABLE   */}
      <div className={styles.table}>
        {(peekTimerOn || myPlayer.gameState.spoonCollected || spectating) && (
          <>
            { (!myPlayer.gameState.spoonCollected && !roundComplete && !spectating) && 
              <button className={styles.peekButtonRed} onClick={() => cancelPeek()}>
                Cancel ({seconds}s)
              </button> 
            }
            <div className={styles.spoons}> 
              {spoons()}
            </div>
          </>
        )}
        {(!(peekTimerOn || myPlayer.gameState.spoonCollected || roundComplete || spectating)) && (
          <button className={styles.peekButtonGreen} onClick={() => peek()} disabled={peekCooldownOn || spectating}>
            {peekCooldownOn ? `Wait (${seconds}s)` : 'Peek at table '}
          </button> 
        )}
        { roundComplete && 
          <div>
            {currentMyPlayer.isHost &&
              <div>
                {currentRound === currentPlayers.length - 1 && 
                  <>
                  <h1> Spoons Game Complete! </h1>
                  <button
                    className={styles.hostActionButton}
                    onClick={backToLobby}
                  > 
                    Back to Lobby
                  </button>
                </>
                }
                {currentRound < currentPlayers.length - 1 &&
                  <>
                    <h1> Move to the next round</h1>
                    <button
                      className={styles.hostActionButton}
                      onClick={nextRound}
                    > 
                      Next Round
                    </button>
                  </>
                }
              </div>
            }
            {!currentMyPlayer.isHost && 
              <>
              {currentRound === currentPlayers.length - 1 && 
                <> 
                  <h1> Spoons Game Complete! </h1> 
                  <h2> Waiting for host to go back to lobby... </h2>
                </>
              }
              {currentRound < currentPlayers.length - 1 && 
                <h1> Waiting for host to move to Round {currentRound + 1}... </h1>
              }
              </>
            }
          </div>
        }
      </div>
      {/* --------------- PLAYER   */}
      <div className={styles.myPlayer}> 
        <h1>
          {spectating && 'SPECTATING:'} {myPlayer.nickname} {myPlayer.gameState.dealer ? '(Dealer)' : ''}
        </h1>
        { spectating && 
          <> 
          <button className={styles.spectating} onClick={spectatePrevious}> Previous Player </button> 
          <button className={styles.spectating}  onClick={spectateNext}> Next Player </button>
          <br/>
          <br/>
          </>
        }
        <div className={styles.playerActions}> 
        <div className={styles.myPlayerCards}>
          {myPlayer.gameState.hand.map((card, index) => {
            return (
              <button 
                className={`${(card.suit === 'diamond' || card.suit === 'heart') ? styles.myPlayerCardRed : styles.myPlayerCard}`} 
                key={`card-${index}`} 
                onClick={e => discard(card)} disabled={cardDrawn === undefined || spectating || fourOfAKind()}
              > 
                <h1> {card.value} {getSuit(card.suit)} </h1>
              </button>
            )
          })}
        </div>
          { cardDrawn && 
            <button 
              className={`${(cardDrawn.suit === 'diamond' || cardDrawn.suit === 'heart') ? styles.myPlayerCardRed : styles.myPlayerCard}`} 
              disabled={spectating}
              onClick={e => discard(cardDrawn)}
            > 
              <h1> {cardDrawn.value} {getSuit(cardDrawn.suit)} </h1>
            </button>
          } 
          { !cardDrawn && !spectating && <div className={styles.myPlayerCardPlaceholder}/> }

          <div className={styles.myPlayerPile}>
            { pileLength > 0 && generatePileDisplay(styles.myPlayerPileCard, pileLength)}
            {!(pileLength > 0 || (roundComplete && !spectating))  && <div className={styles.myPlayerPilePlaceholder}> Waiting for a Card... </div>}
          </div>
        </div>
        {safeMessage && <h1 className={safeMessage === 'ELIMINATED' ? styles.eliminated : styles.safe}> {safeMessage} </h1>}
      </div>
    </div>
  )
}

export default Game;


