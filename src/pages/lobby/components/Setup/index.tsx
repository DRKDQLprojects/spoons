import { CopyToClipboard } from 'react-copy-to-clipboard'
import { DealerType, LobbyInfo, Player } from 'src/types'
import firebase from 'src/firebase/client'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { setupBoard } from 'src/shared/helpers'
import useInterval from 'react-useinterval'

import styles from './Setup.module.css'

import Logo from 'src/shared/components/Logo'
import Button from 'src/shared/components/Button'
import Radio from 'src/shared/components/Radio'
import { Stack, Grid } from '@mui/material'
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
  const updateDealerOn = (value: boolean, type: DealerType) => {
    firebase.database().ref(`${lobbyId}/settings/dealer`).set({
      on: value,
      type: value ? type : "host"
    })
  }
  const updateDealerType = (type: DealerType) => {
    updateDealerOn(true, type)
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

    players.filter(p => p.id !== myPlayer.id).forEach(player => {
      elems.push(
        <Stack key={`lobby-${player.id}`}  className={styles.player} justifyContent="center">
          <Stack direction='column' justifyContent='center' alignItems='center'>
              <Avatar number={player.avatar} size={45}/>
              <h3 style={{ margin: '5px'}}> {player.nickname} {player.isHost && '🤴'} </h3>  
              { myPlayer.isHost &&
                <Button onClick={() => props.removePlayer(lobbyId, player.id)} danger disabled={!myPlayer.isHost} hidden={!myPlayer.isHost}>
                  Kick
                </Button>
              }
          </Stack>
        </Stack>
      )
    })

    for (let i = 0; i < 10 - players.length; i++) {
      elems.push(
        <Stack 
          key={`lobby-empty-player-${i}`} 
          className={styles.emptyPlayer}
          justifyContent="center"
        >
          <Stack direction='column' justifyContent='center' alignItems='center'> 
            <Avatar size={45} number={-1}/>
            <p> Empty </p>
            { myPlayer.isHost &&
              <Button onClick={() => {}} danger disabled hidden> Kick </Button>
            }
          </Stack>
        </Stack>
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
      <br/>
      <Logo size={75}/>
      {/* **************** START / INVITE ****************  */}
      <Stack direction="row" spacing={1}>
          { myPlayer.isHost && 
            <Button success disabled={!myPlayer.isHost || players.length === 1} onClick={() => startGame()}> 
              {players.length > 1 && 'Start Game'}
              {players.length === 1 && 'Waiting for players...'}
            </Button>
          }
          {!myPlayer.isHost && 
            <h2 style={{ marginTop: '10px'}}>
              Waiting for host to start game...
            </h2>
          }
        <CopyToClipboard text={`${process.env.NEXT_PUBLIC_BASE_URL}/join?code=${lobbyId}`} onCopy={() => { }}>
            <Button primary disabled={false} onClick={() => { setSeconds(2); setCopiedTimerOn(true); }}> 
              { copiedTimerOn ? 'COPIED!' : 'INVITE'  }
            </Button>
        </CopyToClipboard>
      </Stack>
      <br/>
      
      <Grid
        justifyContent="center"
        container
      >
        {/* **************** PLAYERS ****************  */}
        <Grid item xs={10} className={styles.players}> 
          <h2> PLAYERS </h2> 
          <br/>
          <Stack direction="row" spacing={1}> 
            <Stack className={styles.player} key={`lobby-${myPlayer.id}`} justifyContent="center">
              <Stack direction='column' justifyContent='center' alignItems='center'>
                  <AvatarPicker
                    number={myPlayer.avatar}
                    size={50}
                    onPrevious={() => { updateAvatar(myPlayer.avatar === 0 ? 9 : myPlayer.avatar - 1)}}
                    onNext={() => updateAvatar((myPlayer.avatar + 1) % 10)}
                  />
                  <h3 style={{ margin: '5px'}}> {myPlayer.nickname} {myPlayer.isHost && '🤴'} </h3>
              </Stack>     
            </Stack>
            <div className={styles.scrollablePlayers}> 
              <Stack 
                direction="row"
                spacing={2}
              > 
                { renderPlayers()}
              </Stack>
            </div>
          </Stack>
        </Grid>
        <br/>
        {/* **************** SETTINGS ****************  */}
        <Grid item xs={10} className={styles.settings}>
          <h2> SETTINGS </h2> 
          <br/>
          <div className={styles.scrollableSettings}>
            <h3> PLAYER POSITIONS ON TABLE </h3>
            {(settings.shuffle) && 
              <p> SHUFFLE - The players next to you will be random each round. </p>
            }
            {(!settings.shuffle) && 
              <p> LOBBY - The players next to you are determined by lobby order. </p>
            }
            <br/>
            <Stack direction="row" flexWrap="wrap">
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
            </Stack>

            <h3> DEALER </h3>
            {(settings.dealer.on && settings.dealer.type === "host") && 
              <p> HOST - The host of the lobby will start with a full pile every round. </p>
            }
            {(settings.dealer.on && settings.dealer.type === "random") && 
              <p> RANDOM - A random player will start with a full pile every round. </p>
            }
            {(settings.dealer.on && settings.dealer.type === "winner") && 
              <p> WINNER - The winner of the last round will start with a full pile (random on first round). </p>
            }
            {!settings.dealer.on && 
              <p> OFF - Every player will start with an equal pile. </p>
            }
            <br/>
            <Stack direction="row" flexWrap="wrap">
                <Radio 
                  id="dealer-host" 
                  label="HOST"
                  checked={settings.dealer.on && settings.dealer.type === "host"} 
                  disabled={!myPlayer.isHost} 
                  onChange={() => updateDealerType("host")}
                />

                <Radio 
                  id="dealer-random" 
                  label="RANDOM"
                  checked={settings.dealer.on && settings.dealer.type === "random"} 
                  disabled={!myPlayer.isHost} 
                  onChange={() => updateDealerType("random")}
                />

                <Radio 
                  id="dealer-winner" 
                  label="WINNER"
                  checked={settings.dealer.on && settings.dealer.type === "winner"} 
                  disabled={!myPlayer.isHost} 
                  onChange={() => updateDealerType("winner")}
                />

                <Radio 
                  id="dealer-off" 
                  label="OFF"
                  checked={!settings.dealer.on} 
                  disabled={!myPlayer.isHost} 
                  onChange={() => updateDealerOn(false, settings.dealer.type)}
                />
            </Stack>

            <h3> PEEKING </h3>
            {(settings.peek.on) && 
              <p> ON - You will only be able to see / collect Spoons by peeking at the table. </p>
            }
            {(!settings.peek.on) && 
              <p> OFF - Spoons will be visible / collectable at all times. </p>
            }
            <br/>

            <Stack direction="row" flexWrap="wrap">
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
            </Stack>

            { settings.peek.on && 
              <>
                <h4> Timer </h4>
                <p> You will be able to peek for {settings.peek.timer}s. </p>
                <br/>
                <Stack direction='row' flexWrap="wrap">
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
                </Stack>
              
                <h4> Cooldown </h4>
                <p> You must wait {settings.peek.cooldown}s before you can peek again. </p>
                <br/>
                <Stack direction='row' flexWrap="wrap">
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
                </Stack>
              </>
            }
            <br/>
            <h3> CLICKS TO COLLECT </h3>
            { settings.clicksToCollect === 1 && <p> {settings.clicksToCollect} CLICK - First person to click a Spoon collects that Spoon.</p>}
            { settings.clicksToCollect > 1 && <p> TUG OF WAR - Another player may interrupt your count to {settings.clicksToCollect} CLICKS.</p> } 
            <br/>
            <Stack direction='row' flexWrap="wrap">
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
            </Stack>
          </div>
        </Grid> 
      </Grid>
      <br/>
    </Fullscreen>
  )
}

export default Setup