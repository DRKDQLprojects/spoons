import { CopyToClipboard } from 'react-copy-to-clipboard'
import { LobbyInfo, Player } from 'src/types'
import firebase from 'src/firebase/client'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { setupBoard } from 'src/shared/helpers'

import styles from './Setup.module.css'
import Logo from 'src/shared/components/Logo'
import Flexbox from 'src/shared/layout/Flexbox'
import OldGrid from 'src/shared/layout/Grid'
import Button from 'src/shared/components/Button'
import Radio from 'src/shared/components/Radio'
import useInterval from 'react-useinterval'
import Container from 'src/shared/layout/Container'

import { Grid } from '@material-ui/core'
import Fullscreen from 'src/shared/layout/Fullscreen'

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

  const [seconds, setSeconds] = useState(-1)
  const [copiedTimerOn, setCopiedTimerOn] = useState(false)

  const [width, setWidth] = useState(-1)
  const [scale, setScale] = useState<string>('1')

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
  const updatePlayerPositions = (value: boolean) => {
    firebase.database().ref(`${lobbyId}/settings/shuffle`).set(value)
  }
  const updatePeekTimer = (value: number) => {
    firebase.database().ref(`${lobbyId}/settings/peek/timer`).set(value)
  }
  const updatePeekCooldown = (value: number) => {
    firebase.database().ref(`${lobbyId}/settings/peek/cooldown`).set(value)
  }

  // ***** TIMER FOR COPIED LABEL *****
  useInterval(() => {
    if (seconds > 0) {
      setSeconds(seconds - 1)
    } else {
      setSeconds(-1)
      setCopiedTimerOn(false)
    }
  }, copiedTimerOn ? 1000 : null)

  // ***** PLAYERS LIST *****

  const renderPlayers = () => {

    let elems = []

    elems.push(
      <div className={styles.myPlayer} key={`lobby-${myPlayer.id}`}>
        <Flexbox column center>
          <Flexbox center> 
            <h2> {myPlayer.nickname} {myPlayer.isHost && '(HOST)'} </h2>
          </Flexbox>
        </Flexbox>
      </div>
    )
    players.filter(p => p.id !== myPlayer.id).forEach(player => {
      elems.push(
        <div key={`lobby-${player.id}`} className={styles.player}>
            <OldGrid
              gridTemplateColumns="1fr 1fr"
              gridTemplateRows=""
            >
              <Flexbox noWrap>
                <Flexbox column center>
                  <Flexbox>
                    <h3> {player.nickname} </h3>
                  </Flexbox>
                  {player.isHost && 
                    <Flexbox>
                      (HOST)
                    </Flexbox>
                  }
                </Flexbox>
              </Flexbox>
              {myPlayer.isHost &&
                <Button onClick={() => props.removePlayer(lobbyId, player.id)} danger disabled={false}>
                  Kick
                </Button>
              }
            </OldGrid>
        </div>
      )
    })

    for (let i = 0; i < 10 - players.length; i++) {
      elems.push(
        <div key={`lobby-empty-player-${i}`} className={styles.emptyPlayer}>
          <OldGrid 
              gridTemplateColumns="3fr 1fr"
              gridTemplateRows=""
            >
            <Flexbox column center>
              <Flexbox>
                Empty
              </Flexbox>
            </Flexbox>
          </OldGrid>
        </div>
      )
    }

    return elems
  }

  useEffect(() => {
    setWidth(window.screen.width)
    window.addEventListener('resize', calculateScale)
    return (() => window.removeEventListener('resize', calculateScale))
  }, [])

  const calculateScale = () => {
    const height = window.screen.height
    const width = window.screen.width

    const baseHeight = 715
    const baseWidth = 1100

    setScale(`${(850 < width && width < baseWidth) ? (width / baseWidth) : 1 }, ${height < baseHeight ? (height / baseHeight) : 1}`)
    setWidth(window.screen.width)
  }
  
  // ********** RENDER **********
  return (
    <Fullscreen>
      <Logo text="Spoons"/>
      <Grid
        container
        direction={width > 850 ? 'row' : 'column'}
        justifyContent="center"
        alignItems="center"
        style={{ transform: `scale(${scale})`, transformOrigin: 'top'}}
      >
        <div 
          className={width > 850 ? styles.gridItem : styles.mobileGridItem}
        >
          <Flexbox center>
            <h2> Lobby {`${players.length}/10`} </h2> 
          </Flexbox>
          <h3> PLAYERS </h3>
          <br/>
          <div className={styles.scrollablePlayers}>
            {renderPlayers()}
          </div>
        </div>
        <div style={{ width: '20px'}}/>
        <div className={styles.gridItem}>
          <Flexbox center>
            <h2> Settings & Modes </h2>
          </Flexbox>
          <Flexbox column spaceBetween noWrap> 
            <div className={styles.scrollableSettings}>
              <Container>
                <h3> DEALER </h3>
                <br/>
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
              </Container>
              
              <Container>
                <h3> PLAYER POSITIONS </h3>
                <br/>
                <Flexbox>
                    <Radio 
                      id="shuffle-off" 
                      label="LOBBY"
                      checked={!settings.shuffle} 
                      disabled={!myPlayer.isHost} 
                      onChange={() => updatePlayerPositions(false)}
                    />

                    <Radio 
                      id="shuffle-on" 
                      label="SHUFFLE"
                      checked={settings.shuffle} 
                      disabled={!myPlayer.isHost} 
                      onChange={() => updatePlayerPositions(true)}
                    />
                </Flexbox>
              </Container>
              <Container>
                <h3> PEEKING </h3>
                <br/>
                <h4> Timer </h4>
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
                
                <h4> Cooldown </h4>
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
              </Container>
            </div>

            <Flexbox noWrap>
              <CopyToClipboard 
                  text={`${process.env.NEXT_PUBLIC_BASE_URL}/join?code=${lobbyId}`}
                  onCopy={() => {}}
                >
                <div style={{ padding: '20px'}}>
                  <Button primary disabled={false} onClick={() => { setSeconds(2); setCopiedTimerOn(true); }}> 
                    { copiedTimerOn ? 'COPIED!' : 'INVITE'  }
                  </Button>
                </div>
              </CopyToClipboard>
              <div style={{ padding: '20px'}}>
                { myPlayer.isHost && 
                  <Button 
                    success
                    disabled={!myPlayer.isHost}
                    onClick={() => startGame()}
                  > 
                    Start
                  </Button>
                }
                {!myPlayer.isHost && 
                  <Flexbox column center>
                    <h2>
                      Waiting for host...
                    </h2>
                  </Flexbox>
                }
              </div>
            </Flexbox>
          </Flexbox>
        </div>
      </Grid>
    </Fullscreen>
  )
}

export default Setup