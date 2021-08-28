import type { NextPage } from 'next'
import styles from './Join.module.css'
import { useState, useEffect } from 'react'
import firebase from 'src/firebase/client'
import { useRouter } from "next/router"
import Loader from 'src/shared/Loader'
import { emptyGameState } from 'src/types'

const Join: NextPage = () => {

  const [nickname, setNickname] = useState('')
  const [avatar, setAvatar] = useState('')
  const [lobbyId, setLobbyId] = useState('')
  const [numPlayers, setNumPlayers] = useState(0)
  const [gameStarted, setGameStarted] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const [joining, setJoining] = useState(false)

  useEffect(() => {

    localStorage.removeItem('saved-player')
    localStorage.removeItem('saved-lobby')

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
        const lobby = lobbies[lobbyId]
        if (lobby) {
          const numPlayers = Object.keys(lobby.players).length

          setNumPlayers(numPlayers)
          setLobbyId(lobbyId)
          setLoading(false)
          setGameStarted(lobby.gameStatus.round > 0)
        } else {
          // More helpful error if lobby doesnt exist
          router.push('/404')
        }
      } else {
        alert('Internal server error')
      }
    })
  }

  const join = () => {
    setJoining(true)

    // TODO : Frontend error
    if (!nickname) {
      alert('You must enter a nickname')
      setJoining(false)
      return
    }

    // TODO: Error - lobby is full
    if (numPlayers + 1 > 10) {
      alert('The lobby is full. Please try again soon ')
      setJoining(false)
      return
    // TODO : Error - game has started already
    } else if (gameStarted) {
      alert('The lobby has already started the game. Please try again soon') 
      setJoining(false)
      return
    // Good to join
    } else {
      // TODO: Check if these are valid before sending 200
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
    }
  }

  if (loading) return (<Loader message="Attempting to find lobby"/>)
  if (joining) return (<Loader message="Joining lobby"/> )

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