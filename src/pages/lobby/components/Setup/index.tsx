import { CopyToClipboard } from 'react-copy-to-clipboard'
import { LobbyInfo, Player } from 'src/types'
import firebase from 'src/firebase/client'
import { Dispatch, SetStateAction } from 'react'
import { setupBoard } from 'src/shared/helpers'

import styles from './Setup.module.css'
import Logo from 'src/shared/components/Logo'
import Flexbox from 'src/shared/layout/Flexbox'
import Grid from 'src/shared/layout/Grid'
import Button from 'src/shared/components/Button'
import Radio from 'src/shared/components/Radio'

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
  const updateDealerOn = (value: boolean, type: boolean) => {
    firebase.database().ref(`${lobbyId}/settings/dealer`).set({
      on: value,
      default: value ? type : true
    })
  }
  const updateDealerDefault = (value: boolean) => {
    updateDealerOn(true, value)
  }
  const updatePeekTimer = (value: number) => {
    firebase.database().ref(`${lobbyId}/settings/peek/timer`).set(value)
  }
  const updatePeekCooldown = (value: number) => {
    firebase.database().ref(`${lobbyId}/settings/peek/cooldown`).set(value)
  }
  
  // ********** RENDER **********
  return (
    <div className={styles.container}>
      <Logo text="Spoons"/>
      {/* <h1 className={styles.title}> {`${host ? host.nickname : ''}'s`} Lobby </h1> */}
      <Grid gridTemplateColumns="2fr 3fr"> 
        <div className={styles.gridItem}>
          <Flexbox center>
            <h2> Lobby {`${players.length}/10`} </h2> 
          </Flexbox>
          <h3> YOU </h3>
          <div className={styles.player}>
            <Flexbox column> 
              <Flexbox>
                {myPlayer.nickname} 
              </Flexbox>
              {myPlayer.isHost && 
                <Flexbox>
                  <h3> HOST </h3>
                </Flexbox>
              }
            </Flexbox>
          </div>
          <h3> PLAYERS </h3>
          {players.filter(p => p.id !== myPlayer.id).map((player) => {
              return (
                <div key={`lobby-${player.id}`} className={styles.player}>
                  <Grid gridTemplateColumns="3fr 1fr">
                    <Flexbox column center>
                      <Flexbox>
                        {player.nickname} 
                      </Flexbox>
                      {player.isHost && 
                        <Flexbox>
                          <h3> HOST </h3>
                        </Flexbox>
                      }
                    </Flexbox>
                    {myPlayer.isHost &&
                      <Button onClick={() => props.removePlayer(lobbyId, player.id)} danger disabled={false}>
                        REMOVE
                      </Button>
                    }
                  </Grid>
                </div>
              )
          })}
        </div>

        <div className={styles.gridItem}>
          <Flexbox center>
            <h2> Settings & Modes </h2>
          </Flexbox>
          <h3> DEALER </h3>

          <Flexbox>
              <Radio 
                id="dealer-random" 
                label="RANDOM"
                checked={settings.dealer.on && settings.dealer.default} 
                disabled={!myPlayer.isHost} 
                onChange={() => updateDealerDefault(true)}
              />

              <Radio 
                id="dealer-winner" 
                label="WINNER"
                checked={settings.dealer.on && !settings.dealer.default} 
                disabled={!myPlayer.isHost} 
                onChange={() => updateDealerDefault(false)}
              />

              <Radio 
                id="dealer-off" 
                label="OFF"
                checked={!settings.dealer.on} 
                disabled={!myPlayer.isHost} 
                onChange={() => updateDealerOn(false, true)}
              />
          </Flexbox>
            

          <h3> PEEKING </h3>

          <h4> TIMER </h4>
          <Flexbox>
            { [2,3,4,5].map(time => {
                return (
                  <Radio 
                    key={`peek-timer-${time}`}
                    id={`peek-timer-${time}`}
                    label={`${time}s`}
                    checked={time === settings.peek.timer}
                    onChange={() => updatePeekTimer(time)}
                    disabled={!myPlayer.isHost}
                  />
                )
              })
            }
          </Flexbox>
          
          <h4> COOLDOWN </h4>
          <Flexbox>
            { [2,3,4,5].map(time => {
                return (
                  <Radio 
                    key={`peek-cooldown-${time}`}
                    id={`peek-cooldown-${time}`}
                    label={`${time}s`}
                    checked={time === settings.peek.cooldown}
                    onChange={() => updatePeekCooldown(time)}
                    disabled={!myPlayer.isHost}
                  />
                )
              })
            }
          </Flexbox>
            <br/>
          <Flexbox center>
            <Button 
              disabled={!myPlayer.isHost}
              onClick={() => startGame()}
            > 
              {(myPlayer.isHost) ? 'Start Game' : 'Waiting for host...'} 
            </Button>
            <CopyToClipboard 
              text={`localhost:3000/spoons/join?code=${lobbyId}`}
              onCopy={() => {}}
            >
              <div style={{marginLeft: "10px"}}>
                <Button primary disabled={false} onClick={() => {}}> 
                  Invite
                </Button>
              </div>
            </CopyToClipboard>
          </Flexbox>
        </div>
      </Grid>
    </div>
  )
}

export default Setup