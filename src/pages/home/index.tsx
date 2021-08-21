import type { NextPage } from 'next'
import styles from './Home.module.css'
import { useState } from 'react'
import { useRouter } from 'next/router'

import firebase from 'src/firebase/client'
import Cookies from 'js-cookie'

const Home: NextPage = () => {

  const [nickname, setNickname] = useState('')
  const [avatar, setAvatar] = useState('')
  const router = useRouter()

  const onCreateLobby = () => {

    if (!nickname) {
      // TODO: Frontend error message 
      return
    }

    const lobbyId = firebase.database().ref().push().key as string
    const playerId = firebase.database().ref(`${lobbyId}/players`).push().key as string
    firebase.database().ref(`${lobbyId}/players/${playerId}`).set({
      id: playerId,
      nickname: nickname,
      avatar: avatar,
      isHost: true
    }).then(() => {
      sessionStorage.setItem('lid', lobbyId)
      sessionStorage.setItem('pid', playerId)
      Cookies.set('saved-lid', lobbyId)
      Cookies.set('saved-pid', playerId)
      router.push('/lobby')
    }).catch(e => {
      // TODO : Generic server error message
      console.log(e)
    })
  }

  return (
    <div className={styles.container}>
        <h1 className={styles.title}>
          Welcome to <span> Spoons</span>
        </h1>
        <label> Nickname </label> 
        <input type="text" value={nickname} onChange={e => setNickname(e.target.value)}/>
        <button onClick={e => onCreateLobby()}> Create Lobby </button>
    </div>
  )
}

export default Home