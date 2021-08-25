import type { NextPage } from 'next'
import styles from './Home.module.css'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

import firebase from 'src/firebase/client'
import Loader from 'src/sharedComponents/Loader'

const Home: NextPage = () => {

  const [nickname, setNickname] = useState('')
  const [avatar, setAvatar] = useState('')
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    localStorage.removeItem('saved-player')
    localStorage.removeItem('saved-lobby')
  }, [])

  const onCreateLobby = () => {
    setLoading(true)

    // TODO : Frontend error
    if (!nickname) {
      alert('You must enter a nickname')
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
      id: playerId,
      nickname: nickname,
      avatar: avatar,
      isHost: true
    }).then(() => {
      sessionStorage.setItem('lid', lobbyId)
      sessionStorage.setItem('pid', playerId)
      router.push('/lobby')
    })
  }

  if (loading) return (<Loader message="Creating lobby"/>)
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