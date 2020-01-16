// See https://championswimmer.in/vuex-module-decorators/
import { Action, Module, Mutation, VuexModule, getModule } from 'vuex-module-decorators'
import io from 'socket.io-client'
import store from '@/store'
import { Composition, Guest, UrlQuerySpec } from '@/types'
import { compositionToUrlQuerySpec } from '@/utils/composition.ts'
import { goTo } from '@/utils/router.ts'

import Settings from '@/store/settings.ts'
const settings = getModule(Settings)

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
  urlQuerySpec: UrlQuerySpec | undefined = undefined

  get defaultGuest (): Guest {
    return { name: settings.me }
  }

  @Mutation
  setGuest (guest: Guest) {
    this.guest = guest
  }
  @Mutation
  setUrlQuerySpec (urlQuerySpec: UrlQuerySpec) {
    this.urlQuerySpec = urlQuerySpec
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
  syncUrlQuerySpec (urlQuerySpec: UrlQuerySpec) {
    if (urlQuerySpec !== this.urlQuerySpec) {
      this.setUrlQuerySpec(urlQuerySpec)
      goTo(urlQuerySpec)
    }
  }
  @Action
  connect () {
    this.socket.connect()
    this.socket.emit('new-guest', this.guest, (g: Guest, urlQuerySpec: UrlQuerySpec) => {
      this.syncGuest(g)
      this.syncUrlQuerySpec(urlQuerySpec)
    })
    this.socket.on('list-guests', (guests: Guest[]) => {
      this.setGuests(guests)
      // TODO: should we also update this.guest? On one hand, the server could
      // send a different version of the guest. On the other hand, maybe the
      // 'list-guests' is more about listing the "other" guests.
    })
    this.socket.on('urlqueryspec', (urlQuerySpec: UrlQuerySpec) => {
      this.syncUrlQuerySpec(urlQuerySpec)
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
    this.socket.emit('update-guest', guest, (g: Guest, urlQuerySpec: UrlQuerySpec) => {
      this.syncGuest(g)
      this.syncUrlQuerySpec(urlQuerySpec)
    })
  }
  @Action
  updateComposition (c: Composition) {
    const urlQuerySpec = compositionToUrlQuerySpec(c)
    if (urlQuerySpec !== this.urlQuerySpec) {
      this.socket.emit('update-urlqueryspec', urlQuerySpec, (ackUrlQuerySpec: UrlQuerySpec) => {
        this.setUrlQuerySpec(ackUrlQuerySpec)
      })
    }
  }
}

const socketStore = getModule(Socket)
window.addEventListener('beforeunload', socketStore.disconnect)
