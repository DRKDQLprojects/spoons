import type { NextPage } from 'next'
import { useState, useEffect } from 'react'
import firebase from 'src/firebase/client'
import { emptyGameState } from 'src/types'
import { useRouter } from 'next/router'
import { useList } from 'react-firebase-hooks/database';
import { convertToPlayers } from 'src/shared/helpers'
import useInterval from 'react-useinterval'

import styles from './Join.module.css'
import Fullscreen from 'src/shared/layout/Fullscreen'
import Loader from 'src/shared/components/Loader'
import Logo from 'src/shared/components/Logo'
import TextField from 'src/shared/components/TextField'
import Button from 'src/shared/components/Button'

const Join: NextPage = () => {

  const [nickname, setNickname] = useState('')
  const [avatar, setAvatar] = useState('')

  const router = useRouter()
  const [snapshots, loading, error] = useList(firebase.database().ref())
  const [joining, setJoining] = useState(false)
  const [nicknameError, setNicknameError] = useState(false)

  const [lobbyId, setLobbyId] = useState('')
  const [numPlayers, setNumPlayers] = useState(0)
  const [host, setHost] = useState('')
  const [gameStarted, setGameStarted] = useState<any>(null)

  const [seconds, setSeconds] = useState(-1)
  const [reloadBufferTimer, setReloadBufferTimer] = useState(false)

  // ***** ON PAGE LOAD *****
  useEffect(() => {
    localStorage.removeItem('saved-player')
    localStorage.removeItem('saved-lobby')
    if (!loading) {
      if (!error) {
        // Wait for URL code to be loaded before getting information
        if (router.isReady) {
          const code = router.query.code as string
          if (code) {
            getLobbyInfo(code)
          } else {
            router.push('/404');
          }
        }
      } else {
        router.push('/404');
      }
    }
  }, [router, snapshots, error, loading])

  // ***** GET LOBBY INFO *****
  const getLobbyInfo = (lobbyId: string) => {
    if (snapshots) {
      const lobbyFound = snapshots.filter(lobby => lobby.key === lobbyId).length === 1
      if (lobbyFound) {
        const lobby = snapshots.filter(lobby => lobby.key === lobbyId)[0].val()
        const players = convertToPlayers(lobby.players)
        const hostAvailable = players.filter(p => p.isHost).length === 1
        setNumPlayers(players.length)
        setLobbyId(lobbyId)
        setHost(hostAvailable ? players.filter(p => p.isHost)[0].nickname : '')
        setGameStarted(lobby.gameStatus.round > 0)
      } else {
        setReloadBufferTimer(true)
        setSeconds(2)
      }
    }
  }

  // ***** RELOAD BUFFER FOR LOBBY INFO
  useInterval(() => {
    if (seconds > 0) {
      setSeconds(seconds-1)
    } else {
      if (snapshots) {
        const lobbyFound = snapshots.filter(lobby => lobby.key === lobbyId).length === 1
        if (!lobbyFound) {
          alert('Lobby not found')
          router.push('/404')
        }
      }
      setSeconds(-1)
      setReloadBufferTimer(false)
    }
  }, reloadBufferTimer ? 1000 : null)

  // ***** JOIN LOBBY *****
  const joinLobby = () => {
    setJoining(true)
    // Entered data not valid
    if (!nickname) {
      setNicknameError(true)
      setJoining(false)
      return
    }
    // Lobby full
    if (numPlayers + 1 > 10) {
      alert('The lobby is full. Please try again soon.')
      setJoining(false)
      return
    } 
    // Game already started
    if (gameStarted) {
      alert('The lobby has already started the game. Please try again soon.') 
      setJoining(false)
      return
    }
    // Join success
    const playerId = firebase.database().ref(`${lobbyId}/players`).push().key as string
    firebase.database().ref(`${lobbyId}/players/${playerId}`).set({
      nickname: nickname,
      avatar: avatar,
      isHost: false,
      gameState: emptyGameState
    }).then(() => {
      sessionStorage.setItem('lid', lobbyId)
      sessionStorage.setItem('pid', playerId)
      router.push("/lobby")
    })
    setJoining(false)
  }

  // ***** CHANGE NICKNAME *****
  const changeNickname = (value: string) => {
    setNicknameError(false)
    setNickname(value)
  }

  // ********** RENDER **********
  if (loading) return (<Loader message="Attempting to find lobby..."/>)
  if (joining) return (<Loader message="Joining lobby..."/> )
  return (
    <Fullscreen center>
        <Logo text="Spoons"/>
        <h1> Joining {`${host}'s`} Spoons Game </h1>
        <label> Nickname </label> 
        <br/>
        <TextField 
          type="text" 
          value={nickname} 
          onPaste={e => e.preventDefault()} 
          onChange={e => changeNickname(e.target.value.replace(/[^a-zA-Z\d]/ig, ""))}
          maxLength={20}
          placeholder={'E.g. Marc7890'}
          error={nicknameError}
        />
        <br/>
        <div className={styles.container}>
          <Button onClick={joinLobby} primary disabled={false}> Join Lobby </Button>
        </div>
        
    </Fullscreen>
  )
}

export default Join