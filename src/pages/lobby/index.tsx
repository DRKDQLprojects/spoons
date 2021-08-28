import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useBeforeunload } from 'react-beforeunload'
import router from "next/router"
import firebase from 'src/firebase/client'
import useInterval from 'react-useinterval'
import { LobbyInfo, emptyLobbyInfo, Player, emptyPlayer, emptyGameState } from 'src/types'

import Setup from './components/Setup'
import Countdown from './components/Countdown'
import Game from './components/Game'
import Loader from 'src/shared/Loader'

const Lobby: NextPage = () => {

  const [myPlayer, setMyPlayer] = useState<Player>(emptyPlayer)
  const [lobby, setLobby] = useState<LobbyInfo>(emptyLobbyInfo)

  // Local Countdown Timer  
  const [seconds, setSeconds] = useState(-1)

  const [loading, setLoading] = useState(true)
  const [renderCountdown, setRenderCountdown] = useState(false)
  const [renderGame, setRenderGame] = useState(false)

  useEffect(() => {
    const lobbyId = sessionStorage.getItem('lid')
    const playerId = sessionStorage.getItem('pid')

    // Successful entry to lobby (create, join, refresh)
    if (lobbyId && playerId) {

      listenForUpdates(lobbyId, playerId)

      // Refresh
      const savedPlayer =  JSON.parse(localStorage.getItem('saved-player') as string)
      const savedLobby =  JSON.parse(localStorage.getItem('saved-lobby') as string)
      if (savedPlayer) { 
        if (savedLobby) {
          firebase.database().ref(lobbyId).set({
            ...savedLobby,
            id: null,
            players: {
              [playerId]: {
                ...savedPlayer
              }
            }
          })
          localStorage.removeItem('saved-lobby')
          localStorage.removeItem('saved-player')
        } else {
          firebase.database().ref(`${lobbyId}/players/${playerId}`).set(savedPlayer)
          localStorage.removeItem('saved-player')
        }
      }
    // Player existed lobby
    } else {
      localStorage.removeItem('saved-player')
      localStorage.removeItem('saved-lobby')
      router.push('/404')
    }
  }, []);

  const listenForUpdates = (lobbyId: string, playerId: string) => {
    firebase.database().ref(lobbyId).on('value', (snapshot) => {
      if (snapshot.exists()) {
        const lobby = snapshot.val() as any
        

        const dbMyPlayer = lobby.players[Object.keys(lobby.players).filter((pid: any) => pid === playerId)[0]]
        if (!dbMyPlayer) {
          // Kicked!
          alert('Kicked!')
          sessionStorage.removeItem('lid')
          sessionStorage.removeItem('pid')
          localStorage.removeItem('saved-player')
          localStorage.removeItem('saved-lobby')
          router.push('/404') 
        } else {
          // Replace host if not available
          const hostAvailable = Object.keys(lobby.players).filter((pid: any) => lobby.players[pid].isHost).length === 1
          if (!hostAvailable) {
            const newHostId = Object.keys(lobby.players)[0]
            firebase.database().ref(`${lobbyId}/players/${newHostId}/isHost`).set(true)
          } else {
            // Map new lobby info to UI
            mapLobbyInfo(lobbyId, lobby, playerId, dbMyPlayer)
          }
        }
      } else {
        alert('Internal server error')
      }
    })
  }

  const mapLobbyInfo = (lobbyId: any, lobby: any, playerId: any, dbMyPlayer: any) => {
  
    const players : Player[] = Object.keys(lobby.players).map(pid => {
      return {
        ...lobby.players[pid],
        id: pid, 
        gameState: (lobby.gameStatus.round === 0 || !lobby.players[pid].gameState.hand) ? emptyGameState : lobby.players[pid].gameState
      }
    })
    
    const myPlayer : Player = { 
        ...dbMyPlayer,
        id: playerId,
        gameState: (lobby.gameStatus.round === 0 || !lobby.players[playerId].gameState.hand) ? emptyGameState : dbMyPlayer.gameState
    }
    const lobbyInfo : LobbyInfo = {
      id: lobbyId,
      players: players,
      gameStatus: lobby.gameStatus,
      settings: lobby.settings
    }

    const countdownStarted = lobbyInfo.gameStatus.countdownStarted
    const renderGame = lobbyInfo.gameStatus.round > 0 && !countdownStarted
    
    setLobby(lobbyInfo)
    setMyPlayer(myPlayer)
    
    if (countdownStarted) {
      setSeconds(5)
    }
    setRenderCountdown(countdownStarted)
    setRenderGame(renderGame)
    setLoading(false)
  }

  useInterval(() => {
    if (5 >= seconds && seconds > 1) {
      setSeconds(seconds - 1)
    } else {
      setSeconds(-1)
      setRenderCountdown(false)
      firebase.database().ref(`${lobby.id}/gameStatus`).set({
        ...lobby.gameStatus,
        round: lobby.gameStatus.round + 1,
        countdownStarted: false
      })
    }
  }, renderCountdown ? 1000 : null)

  const removePlayer = (lobbyId: string, playerId: string) => {
    return firebase.database().ref(`${lobbyId}/players/${playerId}`).remove()
  }

  useBeforeunload(() => {
    firebase.database().ref(lobby.id).off()

    // Prepare to recover the player
    const savedPlayer = JSON.stringify({
      ...myPlayer,
      isHost: false
    })
    localStorage.setItem('saved-player', savedPlayer)

    if (lobby.players.length - 1 === 0) {
       // Prepare to recover the lobby
      const savedLobby = JSON.stringify({
        ...lobby,
        players: null
      })
      localStorage.setItem('saved-lobby', savedLobby)
      firebase.database().ref(lobby.id).remove()
    } else {
      removePlayer(lobby.id, myPlayer.id)
    }
  })

  if (loading) return (<Loader message="Getting lobby information"/>) 
  if (renderCountdown) {
    return (
      <Countdown 
        seconds={seconds}
      />
    )
  }
  if (renderGame) {
    
    return (
      <Game 
        lobby={lobby} 
        myPlayer={myPlayer}
      />
    )
  }

  return (
    <Setup 
      lobby={lobby} 
      myPlayer={myPlayer} 
      removePlayer={removePlayer}
      setSeconds={setSeconds}
    />
  )
  
}

export default Lobby
