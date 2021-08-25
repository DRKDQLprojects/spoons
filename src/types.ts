export type LobbyInfo = {
  id: string,
  gameStatus : {
    round: number,
    countdownStarted: boolean
  }, 
  players: Player[],
  settings: {
    dealer: {
      default: boolean,
      on: true
    },
    peek : {
      cooldown: number,
      timer: number
    }
  }
}

export const emptyLobbyInfo : LobbyInfo = {
  id: '',
  gameStatus : {
    round: 0,
    countdownStarted: false
  }, 
  players: [],
  settings: {
    dealer: {
      on: true,
      default: true,
    },
    peek : {
      cooldown: 4,
      timer: 4
    }
  }
}

export type Player = {
  id: string,
  avatar: string,
  isHost: boolean,
  nickname: string
}

export const emptyPlayer : Player = {
  id: '',
  avatar: '',
  isHost: false,
  nickname: ''
}