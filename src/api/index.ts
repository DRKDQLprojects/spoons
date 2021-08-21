class Api {

  baseUrl: string

  constructor () {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL as string
  }

  buildOptions = (requestType: string, payload: object | null) => {
    let options : RequestInit = {};
    options.method = requestType;
    let headers = { 
        "Accept": "application/json",
        "Content-Type": "application/json"
    };
    options.headers = headers;
    if (payload) options.body = JSON.stringify(payload);
    return options;
  }

  createLobby = (nickname: string, avatar: string) => {
    const payload = {
      nickname: nickname,
      avatar: avatar
    }
    return fetch(`${this.baseUrl}/createLobby`, this.buildOptions('POST', payload))
  }
  
  getLobby = (lobbyId: string, playerId: string, callback: (lobbyInfo: any, player: any) => void) => {
    const payload = {
      callback: callback
    }
    return fetch(`${this.baseUrl}/getLobby?lid=${lobbyId}&pid=${playerId}`, this.buildOptions('GET', payload))
  }
  
  joinLobby = (nickname: string, avatar: string, lobbyId: string) => {
    const _lobbyId = lobbyId;
    const payload = {
      nickname: nickname,
      avatar: avatar,
      lobbyId: _lobbyId
    }
    return fetch(`${this.baseUrl}/joinLobby`, this.buildOptions('POST', payload))
  }

  removePlayer = (lobbyId: string, playerId: string) => {
    return fetch(`${this.baseUrl}/removePlayer?lid=${lobbyId}&pid=${playerId}`, this.buildOptions('DELETE', null))
  }
}

const api = new Api()
export default api