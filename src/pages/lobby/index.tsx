import type { NextPage } from 'next'
import styles from './Lobby.module.css'
import { useEffect, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useBeforeunload } from 'react-beforeunload'
import router, { useRouter } from "next/router"
import Cookies from 'js-cookie';

import firebase from 'src/firebase/client'

type Player = {
  id: string,
  nickname: string, 
  avatar: string,
  isHost: boolean
}

const Lobby: NextPage = () => {

  const [player, setPlayer] = useState<Player | undefined>();
  const [players, setPlayers] = useState<any>([]);
  const [lobbyId, setLobbyId] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [loading, setLoading] = useState(true)

  // TODO : Cleanup this code
  useEffect(() => {
    const lobbyId = sessionStorage.getItem('lid')
    const playerId = sessionStorage.getItem('pid')

    // Successfull entry to lobby
    if (lobbyId && playerId) {

      const serialisedSavedPlayer = Cookies.get('saved-player')
      const savedPlayer = serialisedSavedPlayer ? JSON.parse(serialisedSavedPlayer) : ''

      // Player refreshed
      if (savedPlayer) {
        firebase.database().ref(`${lobbyId}/players/${playerId}`).set(savedPlayer)
        Cookies.remove('saved-player')
      } 

      firebase.database().ref(lobbyId).on('value', (snapshot) => {
        if (snapshot.exists()) {
          const lobby = snapshot.val() as any
          const player = lobby.players[Object.keys(lobby.players).filter((pid: any) => pid === playerId)[0]]
          if (!player) {
            // Kicked out of the game by host - TODO: Meaningful error, open a modal
            alert('Kicked!')
            router.push('/404') 
            sessionStorage.removeItem('lid')
            sessionStorage.removeItem('pid')
            Cookies.remove('saved-lid')
            Cookies.remove('saved-pid')
            Cookies.remove('saved-player')
          } else {
            // Check is host is available, if not assign the next person as the host
            const hostAvailable = Object.keys(lobby.players).filter((pid: any) => lobby.players[pid].isHost).length === 1
            if (!hostAvailable) {
              const newHost = lobby.players[Object.keys(lobby.players)[0]]
              firebase.database().ref(`${lobbyId}/players/${newHost.id}/isHost`).set(true)
            } else {
              updateUI(lobbyId, lobby, player)
            }
          }
        } else {
          // TODO : server error
        }
      })
    // Player exited the lobby
    } else {
      const lidSaved = Cookies.get('saved-lid')
      const pidSaved = Cookies.get('saved-pid')
      if (lidSaved && pidSaved ) {
        removePlayer(lidSaved, pidSaved).then(() => {
          Cookies.remove('saved-lid')
          Cookies.remove('saved-pid')
        })
      }

      const playerSaved = Cookies.get('saved-player')
      if (playerSaved) Cookies.remove('saved-player')
      router.push('/404')
    }
  }, []);

  const updateUI = (lobbyId: any, lobbyInfo: any, player: any) => {
    if (lobbyInfo && player) {
      setPlayers(lobbyInfo.players)
      setPlayer(player)
      setLoading(false)
      setLobbyId(lobbyId)
      setPlayerId(player.id)
    } else {
      setLoading(true)
    }
    
  }

  useBeforeunload(() => {
    // TODO: FIGURE THIS OUT!
    firebase.database().ref(lobbyId).off()
    const cachedPlayer = {
      ...player,
      isHost: false
    }
    const serialisedCachedPlayer = JSON.stringify(cachedPlayer)
    Cookies.set('saved-player', serialisedCachedPlayer)
    removePlayer(lobbyId, playerId)
  })

  const removePlayer = (lobbyId: string, playerId: string) => {
    return firebase.database().ref(`${lobbyId}/players/${playerId}`).remove()
  }

  if (loading) {
    return (
      <div className={styles.container}> 
        <h1 className={styles.title}> <span> Loading... </span> </h1>
      </div>
    )
  } 
  return (
    <div className={styles.container}>
        <h1 className={styles.title}>
          <span> Lobby ({Object.keys(players).length} / 10) </span>
        </h1>
        <h2> Me: </h2> 
        <p> {player && player.nickname} {player && player.isHost &&  '(Host)'} </p>
        <br/>
        <h2> Others: </h2>
        {Object.keys(players).map((i) => {
          if (i !== playerId) return (
            <div key={i}>
              <p > 
                {players[i].nickname} {players[i].isHost && '(Host)'} 
                { player && player.isHost && (
                  <span> <button onClick={(e) => removePlayer(lobbyId, players[i].id)}> Remove </button> </span>
                )} 
              </p>
              
            </div>
          )
        })} 
        <br/>
        <CopyToClipboard 
          text={`localhost:3000/spoons/join?code=${lobbyId}`}
          onCopy={() => {}}
        >
          <button> Copy link to invite others! </button>
        </CopyToClipboard>
        <br/>
        <button disabled={player && !player.isHost}> {(player && player.isHost) ? 'Start Game' : 'Waiting for host to start game...'} </button>
    </div>
  )
}

export default Lobby
