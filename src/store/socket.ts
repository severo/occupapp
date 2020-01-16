// See https://championswimmer.in/vuex-module-decorators/
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import io from 'socket.io-client'
import store from '@/store'
import { Guest } from '@/types'

const socket: SocketIOClient.Socket = io('http://localhost:3000/occupapp-beta', { autoConnect: false })
const guest = { name: `Guest_${new Date().getTime()}` }

@Module({ dynamic: true, store, name: 'socket', namespaced: true })
export default class Socket extends VuexModule {
  // State - state of truth - meant to be exported as a JSON - init definitions

  socket: SocketIOClient.Socket = socket
  guest: Guest = guest
  guests: Guest[] = []

  @Mutation
  updateGuest (guest: Guest) {
    this.guest = guest
  }
  @Mutation
  updateGuests (guests: Guest[]) {
    this.guests = guests
  }

  @Action
  connect () {
    this.socket.connect()
    this.socket.emit('new-guest', guest, (g: Guest) => {
      this.updateGuest(g)
    })
    this.socket.on('list-guests', (guests: Guest[]) => {
      this.updateGuests(guests)
    })
  }
  @Action
  disconnect () {
    this.socket.emit('bye-bye')
    this.socket.disconnect()
    this.updateGuest(guest)
    this.updateGuests([])
  }
}
