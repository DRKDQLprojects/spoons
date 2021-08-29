import styles from './Setup.module.css'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { LobbyInfo, Player } from 'src/types'
import firebase from 'src/firebase/client'
import { Dispatch, SetStateAction } from 'react'
import { setupBoard } from 'src/shared/helpers'
import Logo from 'src/shared/components/Logo'

type SetupProps = {
  myPlayer: Player,
  lobby: LobbyInfo,
  removePlayer: (lobbyId: string, playerId: string) => Promise<any>,
  setSeconds: Dispatch<SetStateAction<number>>;
}

const Setup = (props: SetupProps) => {

  const lobbyId = props.lobby.id
  const gameStatus = props.lobby.gameStatus
  const settings = props.lobby.settings
  const players = props.lobby.players
  const myPlayer = props.myPlayer
  const host = props.lobby.players.filter(p => p.isHost)[0]

  // ***** START GAME *****
  const startGame = () => {
    if (players.length == 1) {
      alert('You need at least 2 players to start')
      return
    } else {
      const newPlayers = setupBoard(players, settings, gameStatus.round)
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

  // ***** UPDATE GAME SETTINGS *****
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
  
  // ********** RENDER **********
  return (
    <>
      <Logo/>
      <h1> {`${host ? host.nickname : ''}'s`} Lobby </h1>
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
      
      <div style={{border: "1px solid black"}}>
        <input type="radio" id="dealer-on" name="dealer-on" checked={settings.dealer.on} disabled={!myPlayer.isHost} onChange={e => updateDealerOn(true)}/>
        <label htmlFor="dealer-on">On</label><br/><br/>
        { settings.dealer.on && 
          <div>
            <input type="radio" id="dealer-random" name="dealer-random" checked={settings.dealer.default} disabled={!myPlayer.isHost} onChange={e => updateDealerDefault(true)}/>
            <label htmlFor="dealer-random">Random</label><br/><br/>

            <input type="radio" id="dealer-winner" name="dealer-winner" checked={!settings.dealer.default} disabled={!myPlayer.isHost} onChange={e => updateDealerDefault(false)}/>
            <label htmlFor="dealer-winner">Winner </label><br/>
          </div>
        }
      </div>
      <br/>
      <input type="radio" id="dealer-off" name="dealer-off" checked={!settings.dealer.on} disabled={!myPlayer.isHost} onChange={e => { updateDealerOn(false) }}/>
      <label htmlFor="dealer-off">Off</label><b/><br/>
      </div>

      <h3> Peeking </h3>

      <label htmlFor="peek-time">Max amount of seconds you can peek at the table (between 2 and 7):</label><br/>
      <input 
        type="number" 
        id="peek-time" 
        name="peek-time" 
        min="2" 
        max="7" 
        disabled={!myPlayer.isHost} 
        value={settings.peek.timer} 
        onChange={(event: any) => updatePeekTimer(parseInt(event.target.value) || settings.peek.timer)}
        onPaste={e => e.preventDefault()}
        onKeyPress={e => e.preventDefault()}
      />
      <br/>

      <label htmlFor="peek-cooldown">Amount of seconds before you can peek again (between 2 and 7):</label><br/>
      <input 
        type="number" 
        id="peek-cooldown" 
        name="peek-cooldown" 
        min="2" 
        max="7" 
        disabled={!myPlayer.isHost} value={settings.peek.cooldown} 
        onChange={(event: any) => updatePeekCooldown(parseInt(event.target.value) || settings.peek.cooldown)}
        onPaste={e => e.preventDefault()}
        onKeyPress={e => e.preventDefault()}
      /><br/>

      <br/>
      <button 
        className={styles.button}
        disabled={!myPlayer.isHost}
        onClick={(e) => startGame()}
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
    </>
  )
}

export default Setup