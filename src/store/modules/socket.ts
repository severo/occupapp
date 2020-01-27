// See https://championswimuserNamer.in/vuex-module-decorators/
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import ioClient from 'socket.io-client'
import Automerge from 'automerge'
import { AutomergeState, Guest } from '@/types'

import { compositionsStore, settingsStore } from '@/store/store-accessor'

// TypeScript definitions copied from socket-server
interface ExportedUser {
  id: string
  name: string
  color: string
}
interface UpdateUserNameAckArgs {
  updated: boolean
  error?: Exception
}
interface UpdateStateAckArgs {
  updated: boolean
  error?: Exception
}
interface SendStateAck {
  ($data: SendStateAckArgs): void
}
interface SendStateAckArgs {
  sent: boolean
  state: string
  error?: Exception
}
interface Exception {
  name: string
  message: string
}

const getGuestFromUsers = (
  id: SocketIOClient.Socket['id'],
  users: ExportedUser[]
): Guest => {
  const user: ExportedUser | undefined = users.find(user => user.id === id)
  if (user === undefined) {
    throw new ReferenceError('Socket id not found in the users list')
  }
  return userToGuest(user)
}

const userToGuest = (user: ExportedUser) => {
  // TODO: validation
  return { sId: user.id, name: user.name, color: user.color }
}

const options: SocketIOClient.ConnectOpts = {
  autoConnect: false
}

// By default: use a local server (https://github.com/LyonDataViz/socket-server/)
// in a development environment, else a remote server
// TODO: make it easier to switch the server
const serverUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/occupapp-beta'
    : 'https://mighty-hollows-64715.herokuapp.com/occupapp-beta'

@Module({ name: 'socket', namespaced: true })
export default class SocketModule extends VuexModule {
  // State - state of truth - meant to be exported as a JSON - init definitions

  // selfLocked is used to lock the user name and color until the server has
  // sent its first list of users.
  // TODO: replace this "hack" by using automerge in socket-server for user name
  // and user color...
  // OR: initialized (or any other state management) - to give an indication to
  // the UI that the data should not be displayed because the connection process
  // has not finished yet
  selfLocked: boolean = true

  socket: SocketIOClient.Socket = ioClient(serverUrl, options)

  guest: Guest = {}
  otherGuests: Guest[] = []

  get defaultGuest (): Guest {
    // TODO: simplify the state mess (with automerge?). Currently, name being
    // empty means the app will wait for the server to send a default name.

    return settingsStore.userName !== '' ? { name: settingsStore.userName } : {}
  }

  @Mutation
  setSelfLocked (selfLocked: boolean) {
    this.selfLocked = selfLocked
  }
  @Mutation
  setGuest (guest: Guest) {
    this.guest = guest
  }
  @Mutation
  setOtherGuests (guests: Guest[]) {
    this.otherGuests = guests
  }

  @Action
  connect () {
    // Events
    // - from server
    //   - 'reset-state'
    //   - 'update-state'
    //   - 'users-list'
    // - to server
    //   - 'update-state'
    //   - 'update-user-name'
    //   - 'update-user-color' - TODO

    // First, update the user name
    this.setGuest(this.defaultGuest)

    this.socket.connect()

    this.socket.on('users-list', (users: ExportedUser[]) => {
      // TODO: validation
      this.setOtherGuestsFromUsers(users)

      if (this.selfLocked === true) {
        // release the lock
        this.setSelfLocked(false)
        // update user name and color if they did not exist.
        // Else: send the new values
        // TODO: simplify this mess (maybe when the rooms will be implemented,
        // and the user will have to specifically join a room, giving their
        // name)
        const guest = getGuestFromUsers(this.socket.id, users)
        if (this.guest.name !== undefined && this.guest.name !== '') {
          // Send local name to server
          guest.name = this.guest.name
          this.emitUpdateUserName(this.guest.name)
        }
        this.setGuest(guest)
        if (guest.name !== settingsStore.userName) {
          settingsStore.setUserName(name)
        }
      }
    })
    this.socket.on('send-state', (ack: SendStateAck) => {
      // The server asks the client to setup the shared state
      ack({
        sent: true,
        state: Automerge.save(compositionsStore.automergeState)
      })
    })
    this.socket.on('reset-state', (encodedState: string) => {
      // State sent by the server - try to blindly set this new state
      // TODO: validate better
      const state: AutomergeState = Automerge.load(encodedState)
      try {
        compositionsStore.resetAutomergeState(state)
      } catch (e) {
        throw new Error(
          'The state received from the socket.io server could not be loaded...'
        )
      }
    })
    this.socket.on('update-state', (changes: Automerge.Change[]) => {
      // State changes sent by the server - try to blindly apply them
      // TODO: validate
      try {
        compositionsStore.applyAutomergeChanges(changes)
      } catch (e) {
        throw new Error(
          'The state changes received from the socket.io server could not be applied...'
        )
      }
    })
  }
  @Action
  setOtherGuestsFromUsers (users: ExportedUser[]) {
    // TODO: validation
    this.setOtherGuests(
      users
        .map(user => userToGuest(user))
        .filter(guest => guest.sId !== this.socket.id)
    )
  }
  @Action
  disconnect () {
    this.socket.disconnect()
    this.setGuest(this.defaultGuest)
    this.setOtherGuests([])
    this.setSelfLocked(true)
    // TODO: go back to some previous composition?
  }
  @Action
  updateGuestName (name: string) {
    // TODO: validate
    this.setGuest({ ...this.guest, name })
    if (name !== settingsStore.userName) {
      settingsStore.setUserName(name)
    }
    this.emitUpdateUserName(name)
  }
  @Action
  emitUpdateUserName (name: string) {
    // TODO: validate to avoid sending an empty string
    this.socket.emit(
      'update-user-name',
      { name },
      (response: UpdateUserNameAckArgs) => {
        // TODO: validate
        if (response.updated !== true) {
          // TODO: improve error message
          throw new Error(response.error ? response.error.message : undefined)
          // TODO: log error (to the console or to a service)
        }
      }
    )
  }
  @Action
  emitUpdateState (changes: Automerge.Change[]) {
    this.socket.emit(
      'update-state',
      changes,
      (response: UpdateStateAckArgs) => {
        // TODO: validate
        if (response.updated !== true) {
          // TODO: improve error message
          throw new Error(response.error ? response.error.message : undefined)
          // TODO: log error (to the console or to a service)
        }
      }
    )
  }
}
