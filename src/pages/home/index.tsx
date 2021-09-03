import type { NextPage } from 'next'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import firebase from 'src/firebase/client'
import { emptyGameState } from 'src/types'

import Loader from 'src/shared/components/Loader'
import Button from 'src/shared/components/Button'
import TextField from 'src/shared/components/TextField'
import Logo from 'src/shared/components/Logo'

import { Grid } from '@material-ui/core'

const Home: NextPage = () => {

  const [nickname, setNickname] = useState('')
  const [avatar, setAvatar] = useState('')

  const [error, setError] = useState('')

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
    if (!nickname || nickname.length < 3) {
      setError('Your nickname must be at least 3 characters long')
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
    setError('')
    setNickname(value)
  }

  // ***** RENDER *****
  if (loading) return (<Loader message="Creating lobby..."/>)
  return (
    <Grid
      container
      spacing={0}
      direction="column"
      justify="center"
      alignItems="center"
      style={{minHeight: '100vh'}}
    >

      <Grid
        container
        spacing={0}
        direction="column"
        justify="center"
        alignItems="center"
      >
        <Logo text="Spoons" fontSize="90px"/>
        <h3> Enter your Nickname </h3> 
        <br/>
        <TextField
          type="text"
          value={nickname}
          onPaste={e => e.preventDefault()} 
          onChange={e => nicknameChanged(e.target.value.replace(/[^a-zA-Z\d]/ig, ""))}
          maxLength={10}
          placeholder={'E.g. Derek1234'}
          error={error !== ''}
        />
        {error && 
          <> 
            <br/>
            {error}
            <br/>
          </>
        }
        <br/>
        <Button onClick={createLobby} primary disabled={false}> Create Lobby </Button>
      </Grid>
    </Grid>
  )
}

export default Home