import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useBeforeunload } from 'react-beforeunload'
import router from "next/router"
import firebase from 'src/firebase/client'
import useInterval from 'react-useinterval'
import { LobbyInfo, emptyLobbyInfo, Player, emptyPlayer, emptyGameState } from 'src/types'
import { useList } from 'react-firebase-hooks/database'

import Setup from './components/Setup'
import Countdown from './components/Countdown'
import Game from './components/Game'
import Loader from 'src/shared/components/Loader'
import { convertToPlayers } from 'src/shared/helpers'

const Lobby: NextPage = () => {

  const [snapshots, loading, error] = useList(firebase.database().ref())
  const [pageLoading, setPageLoading] = useState(true)

  const [myPlayer, setMyPlayer] = useState<Player>(emptyPlayer)
  const [lobby, setLobby] = useState<LobbyInfo>(emptyLobbyInfo)

  const [seconds, setSeconds] = useState(-1)
  const [renderCountdown, setRenderCountdown] = useState(false)
  const [renderGame, setRenderGame] = useState(false)

  const [reloadBufferSeconds, setReloadBufferSeconds] = useState(-1)
  const [reloadBuffer, setReloadBuffer] = useState(false)

  // ***** ON PAGE LOADED *****
  useEffect(() => {
    if (!loading) {
      if (!error) {
        const lobbyId = sessionStorage.getItem('lid')
        const playerId = sessionStorage.getItem('pid')   
        if (lobbyId && playerId) {
          if (snapshots) {
            const lobbyFound = snapshots.filter(lobby => lobby.key === lobbyId).length === 1
            if (lobbyFound) {
              const lobby = snapshots.filter(lobby => lobby.key === lobbyId)[0].val()
              const players = convertToPlayers(lobby.players)
              const myPlayer = players.filter(p => p.id === playerId)[0]
              if (myPlayer) {
                const hostAvailable = players.filter(p => p.isHost).length === 1
                if (hostAvailable) {
                  mapLobbyInfo(lobbyId, playerId, lobby)
                } else {
                  // Replace host if unavailable
                  const newHostId = players[0].id
                  firebase.database().ref(`${lobbyId}/players/${newHostId}/isHost`).set(true)
                }
              } else {
                setReloadBufferSeconds(1)
                setReloadBuffer(true)
              }
            } else {
              setReloadBufferSeconds(1)
              setReloadBuffer(true)
            }
          } else {
            alert('Internal Server Error!')
            leave()
          }
        } else {
          leave()
        }
      } else {
        alert('Internal Server Error!')
        leave()
      }
    }
  }, [snapshots, loading, error]);

  // ***** PREPARE RELOAD
  useBeforeunload(() => {
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

  // ***** RECOVER LOST LOBBY *****
  const recoverLobby = (savedPlayer: any, savedLobby: any) => {
    localStorage.removeItem('saved-lobby')
    localStorage.removeItem('saved-player')
    const lobby = JSON.parse(savedLobby)
    const player = JSON.parse(savedPlayer)
    firebase.database().ref(lobby.id).set({
      ...lobby,
      id: null,
      players: {
        [player.id]: {
          ...player
        }
      }
    })
  }

  // ***** RECOVER LOST PLAYER *****
  const recoverPlayer = (lid: string, pid: string, savedPlayer: any) => {
    localStorage.removeItem('saved-player')
    const player = JSON.parse(savedPlayer)
    firebase.database().ref(`${lid}/players/${pid}`).set(player)
  }

  // ****** RELOADING ******
  useInterval(() => {
    if (reloadBufferSeconds > 0) {
      setReloadBufferSeconds(reloadBufferSeconds - 1)
    } else {
      const lobbyId = sessionStorage.getItem('lid')
      const playerId = sessionStorage.getItem('pid')
      
      if (lobbyId && playerId) {
        const savedLobby = localStorage.getItem('saved-lobby');
        const savedPlayer = localStorage.getItem('saved-player');
        if (savedPlayer) {
          if (savedLobby) {
            recoverLobby(savedPlayer, savedLobby)
          } else {
            recoverPlayer(lobbyId, playerId, savedPlayer)
          }
        } else {
          alert('The host has removed you from the lobby!')
          leave()
        }
      } else {
        alert('Lobby doesnt exist')
        leave()
      }
      setReloadBufferSeconds(-1)
      setReloadBuffer(false)
    }
  }, reloadBuffer ? 1000 : null)

  // ***** COUNTDOWN TIMER *****
  useInterval(() => {
    if (5 >= seconds && seconds > 1) {
      setSeconds(seconds - 1)
    } else {
      setSeconds(-1)
      setRenderCountdown(false)
      setRenderGame(true)
      firebase.database().ref(`${lobby.id}/gameStatus`).set({
        ...lobby.gameStatus,
        round: lobby.gameStatus.round + 1,
        countdownStarted: false
      })
    }
  }, renderCountdown ? 1000 : null)

  // ***** REMOVE PLAYER *****
  const removePlayer = (lobbyId: string, playerId: string) => {
    return firebase.database().ref(`${lobbyId}/players/${playerId}`).remove()
  }

  // ***** MAP DB LOBBY INFO TO UI *****
  const mapLobbyInfo = (lobbyId: any, playerId: any, lobbyDB: any) => {
    const convertedPlayers = convertToPlayers(lobbyDB.players)
    const players = convertedPlayers.map(p => {
      return {
        ...p,
        gameState: lobbyDB.gameStatus.round === 0 ? emptyGameState : p.gameState
      }
    })
    const lobby : LobbyInfo = {
      id: lobbyId,
      players: players,
      gameStatus: lobbyDB.gameStatus,
      settings: lobbyDB.settings
    }
    const myPlayer = players.filter(p => p.id === playerId)[0]
    const countdownStarted = lobby.gameStatus.countdownStarted

    setLobby(lobby)
    setMyPlayer(myPlayer)
    setSeconds(countdownStarted ? 5 : seconds)
    setRenderCountdown(countdownStarted)
    setRenderGame(lobby.gameStatus.round > 0 && !countdownStarted)

    setPageLoading(false)
  }

  // ****** EXIT ******
  const leave = () => {
    router.push('/404')
    sessionStorage.removeItem('lid')
    sessionStorage.removeItem('pid')
    localStorage.removeItem('saved-player')
    localStorage.removeItem('saved-lobby')
  }

  // ********** RENDER **********
  if (loading || pageLoading) {
    return (<Loader message="Getting lobby information..."/>)
  } else if (pageLoading) {
    return (<Loader message="..."/>)
  } else if (renderCountdown) {
    return ( <Countdown seconds={seconds}/>)
  } else if (renderGame) {
    return (
      <Game 
        lobby={lobby} 
        myPlayer={myPlayer}
      />
    )
  } else {
    return (
      <Setup 
        lobby={lobby} 
        myPlayer={myPlayer} 
        removePlayer={removePlayer}
        setSeconds={setSeconds}
      />
    )
  }
}

export default Lobby
