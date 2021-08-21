import type { NextPage } from 'next'
import styles from './Join.module.css'
import { useState, useEffect } from 'react'
import firebase from 'src/firebase/client'
import { useRouter } from "next/router"
import Cookies from 'js-cookie'

const Join: NextPage = () => {

  const [nickname, setNickname] = useState('')
  const [avatar, setAvatar] = useState('')
  const [lobbyId, setLobbyId] = useState('')
  const [numPlayers, setNumPlayers] = useState(-1)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (router.isReady) {
      const code = router.query.code
      if (code) {
        const lobbyId = code as string
        getLobbyInfo(lobbyId)
      } else {
        router.push('/404')
      }
    }

    return () => {
      firebase.database().ref().off()
    }
  }, [router])

  const getLobbyInfo = (lobbyId: string) => {
    firebase.database().ref().on('value', (snapshot) => {
      if (snapshot.exists()) {
        const lobbies = snapshot.val()
        if (lobbies[lobbyId]) {
          const numPlayers = Object.keys(lobbies[lobbyId].players).length
          setNumPlayers(numPlayers)
          setLobbyId(lobbyId)
          setLoading(false)            
        } else {
          // More helpful error if lobby doesnt exist
          router.push('/404')
        }
      } else {
        // TODO: Server error
      }
    })
  }

  const join = () => {
    if (numPlayers + 1 > 10) {
      // TODO: Error - lobby is full
    } else {
      // TODO: Check if these are valid before sending 200
      const playerId = firebase.database().ref(`${lobbyId}/players`).push().key as string
      firebase.database().ref(`${lobbyId}/players/${playerId}`).set({
        id: playerId,
        nickname: nickname,
        avatar: avatar,
        isHost: false
      }).then(() => {
        sessionStorage.setItem('lid', lobbyId)
        sessionStorage.setItem('pid', playerId)
        Cookies.set('saved-lid', lobbyId)
        Cookies.set('saved-pid', playerId)
        router.push("/lobby")
      }).catch(e => {
        console.log(e) // TODO: server error
      })
    }
  }

  if (loading) {
    return (
      <div className={styles.container}> 
        <h1 className={styles.title}> <span> Searching for lobby... </span> </h1>
      </div>
    )
  }

  return (
    <div className={styles.container}>
        <h1 className={styles.title}>
          Joining <span> Spoons</span> game!
        </h1>
        <label> Nickname </label> 
        <input type="text" value={nickname} onChange={e => setNickname(e.target.value)}/>
        <button onClick={e => join()}> Join Lobby </button>
    </div>
  )
}

export default Join