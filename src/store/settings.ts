// See https://championswimmer.in/vuex-module-decorators/
import { Module, Mutation, VuexModule } from 'vuex-module-decorators'
import createPersistedState from 'vuex-persistedstate'
import store from '@/store'

@Module({ dynamic: true, store, name: 'settings', namespaced: true })
export default class Settings extends VuexModule {
  // State - state of truth - meant to be exported as a JSON - init definitions

  // TODO: add color too
  me: string = ''
  showImageColors: boolean = true
  isCollaborationActive: boolean = false

  // Mutations (synchronous)
  @Mutation
  setShowImageColors (value: boolean) {
    this.showImageColors = value
  }
  @Mutation
  enableCollaboration () {
    this.isCollaborationActive = true
  }
  @Mutation
  disableCollaboration () {
    this.isCollaborationActive = false
  }
  @Mutation
  setMe (me: string) {
    this.me = me
  }
}

// After @Module has been called, the dynamic module has been registered in the
// "store" variable.
// It's therefore possible to access it through store.state.settings, for
// example, and to persist it to localStorage with createPersistedState
// See https://github.com/robinvdvleuten/vuex-persistedstate/pull/225#issue-334103245
//
// Note that it can be accessed in the localStorage under the key "settings", eg:
// {"settings":{"me":"uresE","showImageColors":true}}
createPersistedState({
  key: 'settings',
  paths: ['settings.me', 'settings.showImageColors']
})(store)
