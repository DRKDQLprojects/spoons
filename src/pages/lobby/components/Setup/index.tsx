import { CopyToClipboard } from 'react-copy-to-clipboard'
import { LobbyInfo, Player } from 'src/types'
import firebase from 'src/firebase/client'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { setupBoard } from 'src/shared/helpers'

import styles from './Setup.module.css'
import Logo from 'src/shared/components/Logo'
import Flexbox from 'src/shared/layout/Flexbox'
import Button from 'src/shared/components/Button'
import Radio from 'src/shared/components/Radio'
import useInterval from 'react-useinterval'
import Container from 'src/shared/layout/Container'

import { Grid } from '@material-ui/core'
import Fullscreen from 'src/shared/layout/Fullscreen'
import AvatarPicker from 'src/shared/components/Avatar/AvatarPicker'
import Avatar from 'src/shared/components/Avatar'

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
    const newPlayers = setupBoard(players, settings, gameStatus.round)
    const numRounds = Object.keys(newPlayers).length - 1
    const numSpoons = numRounds
    let spoonStatuses = [];
    for (let i = 0; i < numSpoons; i++) { spoonStatuses.push(false)}
    firebase.database().ref(lobbyId).set({
      gameStatus: {
        ...gameStatus,
        numRounds: numRounds,
        countdownStarted: true,
        spoonStatuses: spoonStatuses
      },
      players: newPlayers,
      settings: {
        ...settings
      }
    })
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

  const updatePeekOn = (value: boolean) => {
    firebase.database().ref(`${lobbyId}/settings/peek/on`).set(value)
  }

  const updatePeekTimer = (value: number) => {
    firebase.database().ref(`${lobbyId}/settings/peek/timer`).set(value)
  }
  const updatePeekCooldown = (value: number) => {
    firebase.database().ref(`${lobbyId}/settings/peek/cooldown`).set(value)
  }

  const updateClicksToCollect = (value: number) => {
    firebase.database().ref(`${lobbyId}/settings/clicksToCollect`).set(value)
  }

  const updateAvatar = (value: number) => {
    firebase.database().ref(`${lobbyId}/players/${myPlayer.id}`).set({ 
      ...myPlayer, 
      id: '', 
      avatar: value
    })
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
        <Flexbox column center noWrap>
            <Flexbox center>
              <AvatarPicker
                number={myPlayer.avatar}
                size={50}
                onPrevious={() => { updateAvatar(myPlayer.avatar === 0 ? 7 : myPlayer.avatar - 1)}}
                onNext={() => updateAvatar((myPlayer.avatar + 1) % 8)}
              />
            </Flexbox>
            <Flexbox center noWrap>
              <h3 style={{ margin: '5px'}}> {myPlayer.nickname} </h3>
              <h2> {myPlayer.isHost && '🤴'} </h2>
            </Flexbox>
        </Flexbox>
      </div>
    )
    players.filter(p => p.id !== myPlayer.id).forEach(player => {
      elems.push(
        <div key={`lobby-${player.id}`} className={styles.player}>
          <Flexbox column noWrap>
            <Flexbox center>
              <Avatar number={player.avatar} size={45}/>
            </Flexbox>
            <Flexbox center noWrap>
              <h3 style={{ margin: '5px'}}> {player.nickname} </h3>
              <h2> {player.isHost && '🤴'} </h2>
            </Flexbox>
          </Flexbox>
          {myPlayer.isHost &&
            <Flexbox center>
              <Button onClick={() => props.removePlayer(lobbyId, player.id)} danger disabled={false}>
                Kick
              </Button>
            </Flexbox>
          }
        </div>
      )
    })

    for (let i = 0; i < 10 - players.length; i++) {
      elems.push(
        <div key={`lobby-empty-player-${i}`} className={styles.emptyPlayer}>
          <Flexbox column center noWrap>
            <Flexbox center>
              <Avatar size={45} number={-1}/>
            </Flexbox>
            <Flexbox center>
              <p> Empty </p>
            </Flexbox>
          </Flexbox>
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
      <Flexbox center>
        <Logo size={75}/>
      </Flexbox>
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
          <Flexbox center fullWidth>
            <h1> Lobby {`${players.length}/10`} </h1> 
          </Flexbox>
          <br/>
          <div className={styles.scrollablePlayers}>
            {renderPlayers()}
          </div>
        </div>
        {width > 850 && <div style={{ width: '20px'}}/>}
        <div className={styles.gridItem}>
          <Flexbox center stretch>
            <h1> Settings </h1>
          </Flexbox>
          <Flexbox column spaceBetween noWrap> 
            <div className={styles.scrollableSettings}>
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
                <h3> PEEKING </h3>
                <br/>

                <Flexbox>
                  <Radio 
                    id="peeking-on" 
                    label="ON"
                    checked={settings.peek.on} 
                    disabled={!myPlayer.isHost} 
                    onChange={() => updatePeekOn(true)}
                  />

                  <Radio 
                    id="peeking-off" 
                    label="OFF"
                    checked={!settings.peek.on} 
                    disabled={!myPlayer.isHost} 
                    onChange={() => updatePeekOn(false)}
                  />
                </Flexbox>

                { settings.peek.on && 
                  <>
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
                  </>
                }
              </Container>
              <br/>
              <h3> CLICKS TO COLLECT </h3>
              <br/>
              <Flexbox>
                { [1, 2, 3, 4, 5, 6, 7].map(num => {
                    return (
                      <Radio 
                        key={`clicks-to-collect-${num}`}
                        id={`clicks-to-collect-${num}`}
                        label={`${num}`}
                        checked={num === settings.clicksToCollect}
                        onChange={() => updateClicksToCollect(num)}
                        disabled={!myPlayer.isHost}
                      />
                    )
                  })
                }
              </Flexbox>
            </div>

            <Flexbox noWrap>
              <CopyToClipboard 
                  text={`${process.env.NEXT_PUBLIC_BASE_URL}/join?code=${lobbyId}`}
                  onCopy={() => { }}
                >
                <div className={styles.buttonPadding}>
                  <Button primary disabled={false} onClick={() => { setSeconds(2); setCopiedTimerOn(true); }}> 
                    { copiedTimerOn ? 'COPIED!' : 'INVITE'  }
                  </Button>
                </div>
              </CopyToClipboard>
              <div className={styles.buttonPadding}>
                { myPlayer.isHost && 
                  <Button 
                    success
                    disabled={!myPlayer.isHost || players.length === 1}
                    onClick={() => startGame()}
                  > 
                    {players.length > 1 && 'Start'}
                    {players.length === 1 && 'Waiting for players...'}
                  </Button>
                }
                {!myPlayer.isHost && 
                  <Flexbox column center>
                    <h2 style={{ marginTop: '10px'}}>
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