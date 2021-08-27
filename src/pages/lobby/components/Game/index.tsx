import { useEffect, useState } from 'react';
import { emptyLobbyInfo, emptyPlayer, LobbyInfo, Player, Card } from 'src/types';
import styles from './Game.module.css'
import Loader from 'src/shared/Loader'
import useInterval from 'react-useinterval';
import firebase from 'src/firebase/client'

type GameProps = {
  lobby: LobbyInfo,
  myPlayer: Player
}

const Game = (props: GameProps) => {

  const [lobby, setLobby] = useState<LobbyInfo>(emptyLobbyInfo)

  const [myPlayer, setMyPlayer] = useState<Player>(emptyPlayer)
  const [opponents, setOpponents] = useState<Player[]>([])
  const [numSpoons, setNumSpoons] = useState(0)

  const [cardDrawn, setCardDrawn] = useState<Card | undefined>(undefined)
  const [pile, setPile] = useState<Card[] | undefined>(undefined)

  const [peakTimerOn, setPeakTimerOn] = useState(false)
  const [peakCooldownOn, setPeakCooldownOn] = useState(false)

  const [seconds, setSeconds] = useState(-1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const numRounds = props.lobby.players.length - 1
    const currentRound = props.lobby.gameStatus.round 

    if (currentRound <= numRounds) {
      mapLobbyToUI()
    } else {
      // displayWinner()
    }
  }, [])

  const mapLobbyToUI = () => {
    const remainingPlayers = props.lobby.players.filter(p => p.gameState.remaining)

    const myPlayer = props.myPlayer
    if (myPlayer.gameState.remaining) {
      const opponents = findOpponents(myPlayer, remainingPlayers)
      const numSpoons = remainingPlayers.filter(p => !p.gameState.spoonCollected).length - 1

      setOpponents(opponents)
      setNumSpoons(numSpoons)
    } else {
      const roundComplete = props.lobby.gameStatus.roundComplete
      if (roundComplete) {
        // TODO: Losing screen
        alert('You lose!')
      } else {
        // TODO: Spectating
      }
    }
    setPile(myPlayer.gameState.pile || undefined)
    setLobby(props.lobby)
    setMyPlayer(myPlayer)
    setLoading(false)
  }

  useInterval(() => {
    if (peakTimerOn) {
      if (lobby.settings.peek.timer >= seconds && seconds > 1) {
        setSeconds(seconds - 1)
      } else {
        setSeconds(lobby.settings.peek.cooldown)
        setPeakTimerOn(false)
        setPeakCooldownOn(true)
      }
    } 
    if (peakCooldownOn) {
      if (lobby.settings.peek.cooldown >= seconds && seconds > 1) {
        setSeconds(seconds - 1)
      } else {
        setSeconds(-1)
        setPeakTimerOn(false)
        setPeakCooldownOn(false)
      }
    }
    
  }, (peakCooldownOn || peakTimerOn) ? 1000 : null)

  const peek = () => {
    setPeakTimerOn(true)
    setSeconds(lobby.settings.peek.timer)
  }

  const findOpponents = (player: Player, players: Player[]): Player[] => {
    
    const playerPos = players.findIndex((p) => p.id === player.id)
    const before = players.slice(0, playerPos)
    const after = players.slice(playerPos + 1, players.length)
    return after.concat(before)
  }

  const spoons = () => {
    let list = []
    for (let i = 0; i < numSpoons; i++) {
      list.push(i)
    }
    return (list.map((i) => {
      return (<button key={`spoon-${i}`} className={styles.spoon} disabled={!fourOfAKind()}> 
        Spoon
      </button>)
    }))
  }

  const fourOfAKind = () => {
    const handValues = myPlayer.gameState.hand.map(card => card.value)
    const firstValue = handValues[0]
    return handValues === [firstValue, firstValue, firstValue, firstValue]
  }

  const discard = (card: Card) => {
    
  }

  const drawFromPile = () => {
    const cardDrawn = myPlayer.gameState.pile[0]
    setCardDrawn(cardDrawn)
  }

  const backToLobby = () => {

  }

  if (loading) return <Loader message="Organsing your table"/>

  return (
    <div className={styles.container}> 
      <div className={styles.title}>
        <h1> Playing Spoons :) </h1> 
       { myPlayer.isHost && <button onClick={e => backToLobby()}> Back to Lobby </button> }
      </div>
      <div className={styles.opponents}> 
        {opponents.map(p => {
          return (
            <div key={`opponent-${p.id}`} className={styles.opponent}> 
              <h2> {p.nickname} {p.gameState.dealer ? '(Dealer)' : ''}</h2>
              <div className={styles.playerActions}> 
                { p.gameState.pile && <div className={styles.pile}> {p.gameState.pile.length} </div>}
                { !p.gameState.pile && <div className={styles.pilePlaceholder}/>}
                <div className={styles.cards}>
                  {p.gameState.hand.map((_, index) => {
                    return (
                      <div className={styles.card} key={`opponent-card-${index}`}/> 
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className={styles.table}>
        {peakTimerOn && (
          <div>
            <div>
              Stop ({seconds}s)
            </div>
            <div> 
              {spoons()}
            </div>
          </div>
        )}
        {!peakTimerOn && (
          <button className={styles.peekButton} onClick={() => peek()} disabled={peakCooldownOn}>
            Peek at table {peakCooldownOn ? `(${seconds}s)` : ''}
          </button> 
        )}
      </div>
      <div key={`myPlayer-${myPlayer.id}`} className={styles.myPlayer}> 
        <h1>
          {myPlayer.nickname} {myPlayer.gameState.dealer ? '(Dealer)' : ''}
        </h1>
        
        <div className={styles.playerActions}> 
        <div className={styles.cards}>
          {myPlayer.gameState.hand.map((card, index) => {
            return (
              <button className={styles.card} key={`card-${index}`} onClick={e => discard(card)}> 
                {card.value} ({card.suit})
              </button>
            )
          })}
        </div>
          { cardDrawn && 
            <button className={styles.card} onClick={e => discard(cardDrawn)}> 
              {cardDrawn.value} ({cardDrawn.suit})
            </button>
          } 
          { !cardDrawn && 
            <div className={styles.cardPlaceholder}> Draw from Pile </div>
          }

          { pile && 
            <button className={styles.pile} onClick={e => drawFromPile()} disabled={cardDrawn !== undefined}> {myPlayer.gameState.pile.length} </button>
          }
          {!pile && 
            <div className={styles.pilePlaceholder}> Waiting for card... </div>
          }
          
        </div>
        <div>

        </div>

      </div>
    </div>
  )
}

export default Game;


