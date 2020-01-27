import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { sync } from 'vuex-router-sync'
import router from '@/router'

// Note: you shouldn't need to import store modules here.
// See https://github.com/garyo/vuex-module-decorators-example/
import { initializeStores, modules } from '@/store/store-accessor'

Vue.use(Vuex)

// Initialize the modules using a Vuex plugin that runs when the root store is
// first initialized. This is vital to using static modules because the
// modules don't know the root store when they are loaded. Initializing them
// when the root store is created allows them to be hooked up properly.
const initializer = (store: Store<any>) => {
  // done. Returns an unsync callback fn
  sync(store, router)
  return initializeStores(store)
}
export const plugins = [initializer]
export * from '@/store/store-accessor' // re-export the modules

// Note that it can be accessed in the localStorage under the key "settings", eg:
// {"settings":{"me":"uresE","showImageColors":true}}
const persistedState = createPersistedState({
  key: 'settings',
  paths: ['settings.userName', 'settings.showImageColors']
})

// Export the root store. You can add mutations & actions here as well.
// Note that this is a standard Vuex store, not a vuex-module-decorator one.
// (Perhaps could be, but I put everything in modules)
export default new Store({
  plugins: [initializer, persistedState],
  modules,
  state: { root: 'I am groot' },
  mutations: {},
  actions: {}
})
