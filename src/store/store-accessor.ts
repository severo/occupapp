// This is the "store accessor":
// It initializes all the modules using a Vuex plugin (see store/index.ts)
// In here you import all your modules, call getModule on them to turn them
// into the actual stores, and then re-export them.

import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import BackgroundImageModule from '@/store/modules/backgroundImage'
import CategoriesModule from '@/store/modules/categories'
import CompositionsModule from '@/store/modules/compositions'
import PointsModule from '@/store/modules/points'
import PointsMetricsModule from '@/store/modules/pointsMetrics'
import PointsSelectionModule from '@/store/modules/pointsSelection'
import SettingsModule from '@/store/modules/settings'
import SocketModule from '@/store/modules/socket'

// Each store is the singleton instance of its module class
// Use these -- they have methods for state/getters/mutations/actions
// (result from getModule(...))
export let backgroundImageStore: BackgroundImageModule
export let categoriesStore: CategoriesModule
export let compositionsStore: CompositionsModule
export let pointsStore: PointsModule
export let pointsMetricsStore: PointsMetricsModule
export let pointsSelectionStore: PointsSelectionModule
export let socketStore: SocketModule
export let settingsStore: SettingsModule

// initializer plugin: sets up state/getters/mutations/actions for each store
export function initializeStores (store: Store<any>): void {
  backgroundImageStore = getModule(BackgroundImageModule, store)
  categoriesStore = getModule(CategoriesModule, store)
  compositionsStore = getModule(CompositionsModule, store)
  pointsStore = getModule(PointsModule, store)
  pointsMetricsStore = getModule(PointsMetricsModule, store)
  pointsSelectionStore = getModule(PointsSelectionModule, store)
  settingsStore = getModule(SettingsModule, store)
  socketStore = getModule(SocketModule, store)
}

// for use in 'modules' store init (see store/index.ts), so each module
// appears as an element of the root store's state.
// (This is required!)
export const modules = {
  'backgroundImage': BackgroundImageModule,
  'categories': CategoriesModule,
  'compositions': CompositionsModule,
  'points': PointsModule,
  'pointsMetrics': PointsMetricsModule,
  'pointsSelection': PointsSelectionModule,
  'settings': SettingsModule,
  'socket': SocketModule
}
