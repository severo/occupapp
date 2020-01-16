// See https://championswimmer.in/vuex-module-decorators/
import { Action, Module, Mutation, VuexModule, getModule } from 'vuex-module-decorators'
import io from 'socket.io-client'
import nanoid from 'nanoid'
import store from '@/store'
import { Guest } from '@/types'


const guest = { name: nanoid(5) }
// By default: use a local server (https://github.com/LyonDataViz/socket-server/)
// in a development environment, else a remote server
// TODO: make it easier to switch the server
const serverUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/occupapp-beta' : 'https://immense-coast-15741.herokuapp.com/occupapp-beta'
const socket: SocketIOClient.Socket = io(serverUrl, { autoConnect: false })

@Module({ dynamic: true, store, name: 'socket', namespaced: true })
export default class Socket extends VuexModule {
  // State - state of truth - meant to be exported as a JSON - init definitions

  socket: SocketIOClient.Socket = socket
  guest: Guest = guest
  guests: Guest[] = []

  @Mutation
  setGuest (guest: Guest) {
    this.guest = guest
  }
  @Mutation
  setGuests (guests: Guest[]) {
    this.guests = guests
  }

  @Action
  connect () {
    this.socket.connect()
    this.socket.emit('new-guest', guest, (g: Guest) => {
      this.setGuest(g)
    })
    this.socket.on('list-guests', (guests: Guest[]) => {
      this.setGuests(guests)
    })
  }
  @Action
  disconnect () {
    this.socket.emit('bye-bye')
    this.socket.disconnect()
    this.setGuest(guest)
    this.setGuests([])
  }
  @Action
  updateGuest (guest: Guest) {
    this.socket.emit('update-guest', guest, (g: Guest) => {
      this.setGuest(g)
    })
  }
}

const socketStore = getModule(Socket)
window.addEventListener('beforeunload', socketStore.disconnect)
