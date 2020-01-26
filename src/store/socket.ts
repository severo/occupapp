// See https://championswimmer.in/vuex-module-decorators/
import {
  Action,
  Module,
  Mutation,
  VuexModule,
  getModule
} from 'vuex-module-decorators'
import ioClient from 'socket.io-client'
import Automerge from 'automerge'
import store from '@/store'
import { Composition, Guest } from '@/types'

import Compositions from '@/store/compositions.ts'
import Settings from '@/store/settings.ts'
const compositions = getModule(Compositions)
const settings = getModule(Settings)

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

const emitUpdateUserName = (socket: SocketIOClient.Socket, name: string) => {
  // TODO: validate to avoid sending an empty string
  socket.emit(
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
const emitUpdateState = (socket: SocketIOClient.Socket, data: object) => {
  // TODO: validate
  socket.emit('update-state', data, (response: UpdateStateAckArgs) => {
    // TODO: validate
    if (response.updated !== true) {
      // TODO: improve error message
      throw new Error(response.error ? response.error.message : undefined)
      // TODO: log error (to the console or to a service)
    }
  })
}

const options: SocketIOClient.ConnectOpts = {
  autoConnect: false
}

declare type SharedState = Automerge.Doc<{ composition: Composition }>

// By default: use a local server (https://github.com/LyonDataViz/socket-server/)
// in a development environment, else a remote server
// TODO: make it easier to switch the server
const serverUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/occupapp-beta'
    : 'https://immense-coast-15741.herokuapp.com/occupapp-beta'

const prepareAndGoToComposition = (c: any): void => {
  const d = {
    id: c.id,
    backgroundImage: { ...c.backgroundImage },
    categories: Object.keys(c.categories).map((id: string) => ({ ...c.categories[id] })),
    points: Object.keys(c.points).map((id: string) => ({ ...c.points[id] }))
  }
  compositions.updateCurrentComposition(d)
}

@Module({ dynamic: true, store, name: 'socket', namespaced: true })
export default class Socket extends VuexModule {
  // State - state of truth - meant to be exported as a JSON - init definitions

  // selfLocked is used to lock the user name and color until the server has
  // sent its first list of users.
  // TODO: replace this "hack" by using automerge in socket-server for user name
  // and user color...
  // OR: initialized (or any other state management) - to give an indication to
  // the UI that the data should not be displayed because the connection process
  // has not finished yet
  selfLocked: boolean = true
  // TODO: set private - there is no need to access the socket from outside of
  // this class

  socket: SocketIOClient.Socket = ioClient(serverUrl, options)

  guest: Guest = this.defaultGuest
  otherGuests: Guest[] = []
  sharedState: SharedState = Automerge.init()

  get defaultGuest (): Guest {
    // TODO: simplify the state mess (with automerge?). Currently, name being
    // empty means the app will wait for the server to send a default name.
    if (settings.me !== '') {
      return { name: settings.me }
    } else {
      return {}
    }
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
  setSharedState (sharedState: SharedState) {
    this.sharedState = sharedState
  }
  @Mutation
  setOtherGuests (guests: Guest[]) {
    this.otherGuests = guests
  }

  @Action
  connect () {
    // Events
    // - from server
    //   - 'state'
    //   - 'users-list'
    // - to server
    //   - 'connect'
    //   - 'disconnect'
    //   - 'update-state'
    //   - 'update-user-name'
    //   - 'update-user-color'

    this.socket.connect()

    // this.emitColor()
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
          emitUpdateUserName(this.socket, this.guest.name)
        }
        this.setGuest(guest)
        if (guest.name !== settings.me) {
          settings.setMe(name)
        }
      }
    })
    this.socket.on('state', (state: string) => {
      // TODO: validate better
      const newSharedState: SharedState = Automerge.load(state)
      try {
        // State sent by the server on initial connection - try to blindly apply this new state
        prepareAndGoToComposition(newSharedState.composition)
        this.setSharedState(newSharedState)
      } catch (e) {
        console.warn(
          'The state received from the socket.io server has no valid composition...'
        )
        // console.warn('The state received from the socket.io server has no valid composition. Sending the local state to it instead.')
        // TODO: improve the following, that works only if newComposition is composed of only 1 change (INITIALIZATION), as if it was created by Automerge.init()
        // TODO: better use a ack/callback argument, to answer to the server
        // const changes: Automerge.Change[] = Automerge.getChanges(
        //   Automerge.init(),
        //   this.sharedState
        // )
        // emitUpdateState(this.socket, changes)
      }
    })
    this.socket.on('update-state', (changes: Automerge.Change[]) => {
      // TODO: validate
      // TODO: try catch, since it could throw
      const newSharedState: SharedState = Automerge.applyChanges(
        this.sharedState,
        changes
      )
      const conflicts = Automerge.getConflicts(newSharedState, 'composition')
      if (conflicts) {
        console.warn('Conflicts in the last received changes')
        console.warn(conflicts)
      }
      if (Automerge.equals(newSharedState.composition, {})) {
        return
      }
      const hasChanged: boolean = !Automerge.equals(
        newSharedState,
        this.sharedState
      )
      this.setSharedState(newSharedState)
      if (hasChanged) {
        // update local state only if something has changed after merging the changes
        prepareAndGoToComposition(newSharedState.composition)
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
    // TODO: what to do with the composition?
  }
  @Action
  updateGuestName (name: string) {
    // TODO: validate
    this.setGuest({ ...this.guest, name })
    if (name !== settings.me) {
      settings.setMe(name)
    }
    emitUpdateUserName(this.socket, name)
  }

  // TODO: Change any type
  @Action
  change (callback: any) {
    const newSharedState = Automerge.change(this.sharedState, callback)
    const changes = Automerge.getChanges(this.sharedState, newSharedState)
    this.setSharedState(newSharedState)
    emitUpdateState(this.socket, changes)
  }
  @Action
  updateComposition (c: Composition) {
    console.log('socket has been asked by the app to update the composition')
    //   // TODO: remove the need to init a new doc on each event, and use Automerge
    //   // to manage the source of truth
    //
    //   // Automerge.equals just used because it provides (quasi)deepEqual for Javascript objects
    //   const hasChanged = !Automerge.equals(c, this.sharedState.composition)
    //   if (hasChanged) {
    //     const newSharedState = Automerge.change(this.sharedState, doc => { doc.composition = c })
    //     const changes = Automerge.getChanges(this.sharedState, newSharedState)
    //     this.setSharedState(newSharedState)
    //     emitUpdateState(this.socket, changes)
    //   }
  }
}

const socket = getModule(Socket)
window.addEventListener('beforeunload', socket.disconnect)
