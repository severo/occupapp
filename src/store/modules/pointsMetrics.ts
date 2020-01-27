// Current points metrics

// See https://championswimmer.in/vuex-module-decorators/
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'

export interface Area {
  pointId: string
  area: number
}

@Module({ name: 'pointsMetrics', namespaced: true })
export default class PointsMetricsModule extends VuexModule {
  // IMPORTANT. We use a hack to add Vue reactivity to Map and Set objects
  // See https://stackoverflow.com/a/45441321/7351594

  // State - state of truth - meant to be exported as a JSON - init definitions
  areas: Map<string, Area> = new Map()
  areasChangeTracker: number = 1

  // Getters - cached, not meant to be exported
  get areasAsMap (): Map<string, Area> {
    // By using `areasChangeTracker` we tell Vue that this property depends on it,
    // so it gets re-evaluated whenever `listChangeTracker` changes - HACK
    return this.areasChangeTracker ? this.areas : this.areas
  }
  get size (): number {
    return this.areasAsMap.size
  }
  get getArea (): (id: string) => Area | undefined {
    return (id: string): Area | undefined => this.areasAsMap.get(id)
  }

  // Mutations (synchronous)
  @Mutation
  setAreas (areas: Map<string, Area>) {
    this.areas = areas
    // Trigger Vue updates
    this.areasChangeTracker += 1
  }
  @Mutation
  setArea (area: Area) {
    this.areas.set(area.pointId, area)
    this.areasChangeTracker += 1
  }
  // Actions
  // Important: actions only receive 1 argument (payload). If you want to
  // receive various arguments -> fields of an Object
  @Action
  clear () {
    this.setAreas(new Map())
  }
}