import type { NextPage } from 'next'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import firebase from 'src/firebase/client'
import { emptyGameState } from 'src/types'

import styles from './Home.module.css'
import Loader from 'src/shared/components/Loader'
import Fullscreen from 'src/shared/layout/Fullscreen'
import Button from 'src/shared/components/Button'
import TextField from 'src/shared/components/TextField'
import Logo from 'src/shared/components/Logo'

const Home: NextPage = () => {

  const [nickname, setNickname] = useState('')
  const [avatar, setAvatar] = useState('')

  const [error, setError] = useState(false)

  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // ***** ON PAGE LOAD *****
  useEffect(() => {
    localStorage.removeItem('saved-player')
    localStorage.removeItem('saved-lobby')
  }, [])

  // ***** CREATE LOBBY *****
  const createLobby = () => {
    setLoading(true)

    // Entered data not valid
    if (!nickname) {
      setError(true)
      setLoading(false)
      return
    }

    const lobbyId = firebase.database().ref().push({
      gameStatus: {
        round: 0,
        countdownStarted: false
      },
      settings: {
        dealer: {
          on: true,
          default: true
        },
        peek: {
          timer: 4,
          cooldown: 4
        }
      }
    }).key as string
    const playerId = firebase.database().ref(`${lobbyId}/players`).push().key as string
    firebase.database().ref(`${lobbyId}/players/${playerId}`).set({
      nickname: nickname,
      avatar: avatar,
      isHost: true,
      gameState: emptyGameState
    }).then(() => {
      sessionStorage.setItem('lid', lobbyId)
      sessionStorage.setItem('pid', playerId)
      router.push('/lobby')
    })
  }

  // ***** SET NICKNAME, SET ERROR FALSE *****
  const nicknameChanged = (value: string) => {
    setError(false)
    setNickname(value)
  }

  // ***** RENDER *****
  if (loading) return (<Loader message="Creating lobby..."/>)
  return (
    <Fullscreen center>
        <Logo text="Spoons"/>
        <label> Nickname </label> 
        <br/>
        <TextField
          type="text"
          value={nickname}
          onPaste={e => e.preventDefault()} 
          onChange={e => nicknameChanged(e.target.value.replace(/[^a-zA-Z\d]/ig, ""))}
          maxLength={20}
          placeholder={'E.g. Derek1234'}
          error={error}
        />
        <br/>
        <Button onClick={createLobby} primary disabled={false}> Create Lobby </Button>
        <br/>
    </Fullscreen>
  )
}

export default Home