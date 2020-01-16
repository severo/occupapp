// See https://championswimmer.in/vuex-module-decorators/
import { Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'

@Module({ dynamic: true, store, name: 'socket', namespaced: true })
export default class Settings extends VuexModule {
  // State - state of truth - meant to be exported as a JSON - init definitions

  socket: SocketIOClient.Socket | undefined = undefined

  get isConnected (): boolean {
    return this.socket === undefined
  }
  get serverUrl (): URL {
    // 'https://immense-coast-15741.herokuapp.com/'
    const base = 'http://localhost:3000/'
    // will throw a ReferenceError exception if the URL is incorrect
    return new URL(base)
  }

  // Mutations (synchronous)
  @Mutation
  setSocket (socket: SocketIOClient.Socket) {
    this.socket = socket
  }
  @Mutation
  deleteSocket () {
    this.socket = undefined
  }
}
