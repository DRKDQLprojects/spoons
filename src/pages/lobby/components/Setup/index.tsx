import styles from './Setup.module.css'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { emptyLobbyInfo, emptyPlayer, LobbyInfo, Player } from 'src/types'
import firebase from 'src/firebase/client'
import { useEffect, useState, Dispatch, SetStateAction } from 'react'
import { setupBoard } from 'src/shared/helpers'

type SetupProps = {
  myPlayer: Player,
  lobby: LobbyInfo,
  removePlayer: (lobbyId: string, playerId: string) => Promise<any>,
  setSeconds: Dispatch<SetStateAction<number>>;
}

const Setup = (props: SetupProps) => {

  const [lobbyId, setLobbyId] = useState('')
  const [gameStatus, setGameStatus] = useState(emptyLobbyInfo.gameStatus)
  const [settings, setSettings] = useState(emptyLobbyInfo.settings)
  const [players, setPlayers] = useState(emptyLobbyInfo.players)
  const [myPlayer, setMyPlayer] = useState(emptyPlayer)

  useEffect(() => {
    setLobbyId(props.lobby.id)
    setGameStatus(props.lobby.gameStatus)
    setSettings(props.lobby.settings)
    setPlayers(props.lobby.players)
    setMyPlayer(props.myPlayer)
  }, [props])

  const play = () => {
    if (players.length == 1) {
      alert('You need at least 2 players to start')
      return
    } else {
      
      // setupBoard
      const newPlayers = setupBoard(players, settings)
      
      firebase.database().ref(lobbyId).set({
        gameStatus: {
          ...gameStatus,
          countdownStarted: true
        },
        players: newPlayers,
        settings: {
          ...settings
        }
      })
    }
  }

  const updateDealerOn = (value: boolean) => {
    firebase.database().ref(`${lobbyId}/settings/dealer`).set({
      on: value,
      default: value ? value : true
    })
  }

  const updateDealerDefault = (value: boolean) => {
    firebase.database().ref(`${lobbyId}/settings/dealer/default`).set(value)
  }

  const updatePeekTimer = (value: number) => {
    firebase.database().ref(`${lobbyId}/settings/peek/timer`).set(value)
  }

  const updatePeekCooldown = (value: number) => {
    firebase.database().ref(`${lobbyId}/settings/peek/cooldown`).set(value)
  }
  
  return (
    <div className={styles.container}>
        <h1 className={styles.title}>
          <span> Lobby ({players.length} / 10) </span>
        </h1>
        <h2> Me: </h2> 
        <p> {myPlayer.nickname} {myPlayer.isHost &&  '(Host)'} </p>
        <br/>
        <h2> Other players: </h2>
        {players.map((player) => {
            if (player.id === myPlayer.id) return
            return (
              <div key={player.id}>
                <p > 
                  {player.nickname} {player.isHost && '(Host)'} 
                  { myPlayer.isHost && (
                    <span> <button onClick={(e) => props.removePlayer(lobbyId, player.id)}> Remove </button> </span>
                  )} 
                </p>
             </div>
            )
        })} 
        <br/>
        <br/>
        <h2> Game Options: </h2>

      
        <h3> Dealer </h3>

        <div> 
        <input type="radio" id="dealer-on" name="dealer-on" checked={settings.dealer.on} disabled={!myPlayer.isHost} onChange={e => updateDealerOn(true)}/>
        <label htmlFor="dealer-on">On</label><br/><br/>

        { settings.dealer.on && 
          <div style={{ marginLeft: "20px"}}>
            <input type="radio" id="dealer-random" name="dealer-random" checked={settings.dealer.default} disabled={!myPlayer.isHost} onChange={e => updateDealerDefault(true)}/>
            <label htmlFor="dealer-random">Random dealer every eound</label><br/><br/>

            <input type="radio" id="dealer-winner" name="dealer-winner" checked={!settings.dealer.default} disabled={!myPlayer.isHost} onChange={e => updateDealerDefault(false)}/>
            <label htmlFor="dealer-winner">Winner deals every round</label><br/>
          </div>
        }
        <br/>
        <input type="radio" id="dealer-off" name="dealer-off" checked={!settings.dealer.on} disabled={!myPlayer.isHost} onChange={e => { updateDealerOn(false) }}/>
        <label htmlFor="dealer-off">Off - Deck will be spread evenly between players</label><b/><br/>
        </div>

        <h3> Peeking </h3>

        <label htmlFor="peek-time">Max amount of seconds you can peek at the table (between 2 and 7):</label><br/>
        <input type="number" id="peek-time" name="peek-time" min="2" max="7" disabled={!myPlayer.isHost} value={settings.peek.timer} 
          onChange={(event: any) => updatePeekTimer(parseInt(event?.target.value))}
          onKeyPress={(event: any) => event.preventDefault()}
        /><br/>

        <label htmlFor="peek-cooldown">Amount of seconds before you can peek again (between 2 and 7):</label><br/>
        <input type="number" id="peek-cooldown" name="peek-cooldown" min="2" max="7" disabled={!myPlayer.isHost} value={settings.peek.cooldown} 
          onChange={(event: any) => updatePeekCooldown(parseInt(event.target.value))}
          onKeyPress={(event: any) => event.preventDefault()}
        /><br/>

        <br/>
        <button 
          className={styles.button}
          disabled={!myPlayer.isHost}
          onClick={(e) => play()}
        > 
          {(myPlayer.isHost) ? 'Start Game' : 'Waiting for host to start game...'} 
        </button>

        <br/>
        <CopyToClipboard 
          text={`localhost:3000/spoons/join?code=${lobbyId}`}
          onCopy={() => {}}
        >
          <button className={styles.button}> Copy link to invite others! </button>
        </CopyToClipboard>
    </div>
  )
}

export default Setup