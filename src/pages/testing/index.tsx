import type { NextPage } from 'next'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import firebase from 'src/firebase/client'
import { emptyGameState, emptyGameStatus, emptySettings } from 'src/types'

import Loader from 'src/shared/components/Loader'
import Button from 'src/shared/components/Button'
import TextField from 'src/shared/components/TextField'
import Logo from 'src/shared/components/Logo'
import { Grid } from '@mui/material'
import AvatarPicker from 'src/shared/components/Avatar/AvatarPicker'
import Fullscreen from 'src/shared/layout/Fullscreen'

const Home: NextPage = () => {

  const router = useRouter()

  const [nickname, setNickname] = useState('')
  const [avatar, setAvatar] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // ***** ON PAGE LOAD *****
  useEffect(() => {
    localStorage.removeItem('saved-player')
    localStorage.removeItem('saved-lobby')
  }, [])

  // ***** CREATE LOBBY *****
  const createLobby = () => {
    // Entered data not valid
    if (!nickname || nickname.length < 3) {
      setError('Your nickname must be at least 3 characters long')
      return
    }

    setLoading(true)

    // Initial connection
    firebase.database().ref().push({
      gameStatus: emptyGameStatus,
      settings: emptySettings
    }).then(ref => {
      const lobbyId = ref.key as string
      const playerId = firebase.database().ref(`${lobbyId}/players`).push().key as string

      firebase.database().ref(`${lobbyId}/players/${playerId}`).set({
        nickname: nickname,
        avatar: avatar,
        isHost: true,
        gameState: emptyGameState
      }).then(() => {
        sessionStorage.setItem('lid', lobbyId)
        sessionStorage.setItem('pid', playerId)

        let i = 0;
        while (i < 9) {        
          const botId = firebase.database().ref(`${lobbyId}/players`).push().key as string
          firebase.database().ref(`${lobbyId}/players/${botId}`).set({
            nickname: `player${i + 1}`,
            avatar: i + 1,
            isHost: false,
            gameState: emptyGameState
          });
          i++;
        }

        router.push('/lobby')
      })
    })
    .catch(e => {
      setError("This application is in testing. The developer has disabled it's use")
      setLoading(false)
    })
  }

  // ***** RENDER *****
  if (loading) return (<Loader message="Creating lobby..."/>)
  return (
    <Fullscreen>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        <Logo/>
        <br/>
        <h2> Choose your Avatar </h2> 
        <br/>
        <AvatarPicker
         number={avatar}
         onPrevious={() => { setAvatar(avatar === 0 ? 9 : avatar - 1)}}
         onNext={() => { setAvatar((avatar + 1) % 10)}}
        />
        <br/>
        <h2> Enter your Nickname </h2> 
        <br/>
        <TextField
          type="text"
          value={nickname}
          onPaste={e => e.preventDefault()} 
          onChange={e =>  { 
            const val = e.target.value.replace(/[^a-zA-Z\d]/ig, "");
            setError('')
            setNickname(val)
          }}
          maxLength={10}
          placeholder={'E.g. Derek12'}
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
        <Button onClick={createLobby} primary disabled={false}> TEST </Button>
      </Grid>
    </Fullscreen>
  )
}

export default Home