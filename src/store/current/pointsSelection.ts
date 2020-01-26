// Current points selection

// See https://championswimmer.in/vuex-module-decorators/
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'

@Module({ dynamic: true, store, name: 'pointsSelection', namespaced: true })
export default class PointsSelection extends VuexModule {
  // IMPORTANT. We use a hack to add Vue reactivity to Map and Set objects
  // See https://stackoverflow.com/a/45441321/7351594

  // State - state of truth - meant to be exported as a JSON - init definitions
  ids: Set<string> = new Set()
  idsChangeTracker: number = 1

  // Getters - cached, not meant to be exported
  get asSet (): Set<string> {
    // By using `listChangeTracker` we tell Vue that this property depends on it,
    // so it gets re-evaluated whenever `listChangeTracker` changes - HACK
    return this.idsChangeTracker ? this.ids : this.ids
  }
  get asArray (): string[] {
    return [...this.asSet.values()]
  }
  get size (): number {
    return this.asSet.size
  }
  get has (): (id:string) => boolean {
    return (id:string): boolean => this.asSet.has(id)
  }

  // Mutations (synchronous)
  @Mutation
  set (ids: Set<string>) {
    this.ids = ids
    // Trigger Vue updates
    this.idsChangeTracker += 1
  }
  @Mutation
  add (id: string) {
    this.ids.add(id)
    this.idsChangeTracker += 1
  }
  @Mutation
  delete (id: string) {
    this.ids.delete(id)
    this.idsChangeTracker += 1
  }
  // Actions
  @Action
  fromArray (ids: string[]) {
    this.set(new Set(ids))
  }
  @Action
  clear () {
    this.set(new Set())
  }
  @Action
  toggle (id: string) {
    if (this.asSet.has(id)) {
      this.delete(id)
    } else {
      this.add(id)
    }
  }
}
