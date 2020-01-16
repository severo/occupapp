// See https://championswimmer.in/vuex-module-decorators/
import { Action, Module, Mutation, VuexModule, getModule } from 'vuex-module-decorators'
import io from 'socket.io-client'
import store from '@/store'
import { Guest } from '@/types'

import Settings from '@/store/settings.ts'

const settings = getModule(Settings, store)
// By default: use a local server (https://github.com/LyonDataViz/socket-server/)
// in a development environment, else a remote server
// TODO: make it easier to switch the server
const serverUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/occupapp-beta' : 'https://immense-coast-15741.herokuapp.com/occupapp-beta'
const socket: SocketIOClient.Socket = io(serverUrl, { autoConnect: false })

@Module({ dynamic: true, store, name: 'socket', namespaced: true })
export default class Socket extends VuexModule {
  // State - state of truth - meant to be exported as a JSON - init definitions

  socket: SocketIOClient.Socket = socket
  guest: Guest = this.defaultGuest
  guests: Guest[] = []

  get defaultGuest (): Guest {
    return { name: settings.me }
  }

  @Mutation
  setGuest (guest: Guest) {
    this.guest = guest
  }
  @Mutation
  setGuests (guests: Guest[]) {
    this.guests = guests
  }

  @Action
  syncGuest (guest: Guest) {
    this.setGuest(guest)
    if (guest.name !== settings.me) {
      settings.setMe(guest.name)
    }
  }
  @Action
  connect () {
    this.socket.connect()
    this.socket.emit('new-guest', this.guest, (g: Guest) => {
      this.syncGuest(g)
    })
    this.socket.on('list-guests', (guests: Guest[]) => {
      this.setGuests(guests)
      // TODO: should we also update this.guest? On one hand, the server could
      // send a different version of the guest. On the other hand, maybe the
      // 'list-guests' is more about listing the "other" guests.
    })
  }
  @Action
  disconnect () {
    this.socket.emit('bye-bye')
    this.socket.disconnect()
    this.syncGuest(this.defaultGuest)
    this.setGuests([])
  }
  @Action
  updateGuest (guest: Guest) {
    this.socket.emit('update-guest', guest, (g: Guest) => {
      this.syncGuest(g)
    })
  }
}

const socketStore = getModule(Socket)
window.addEventListener('beforeunload', socketStore.disconnect)
