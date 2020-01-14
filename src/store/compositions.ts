// See https://championswimmer.in/vuex-module-decorators/
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'
import { Composition } from '@/utils/types.ts'

@Module({ dynamic: true, store, name: 'compositions', namespaced: true })
export default class Compositions extends VuexModule {
  // State - state of truth - meant to be exported as a JSON - init definitions
  // Currently: 1-to-1 correspondance between pictures and compositions
  // TODO allow various compositions for a given picture?

  list: Map<string, Composition> = new Map()
  listChangeTracker: number = 1

  // Getters - cached, not meant to be exported
  get asMap (): Map<string, Composition> {
    // By using `listChangeTracker` we tell Vue that this property depends on it,
    // so it gets re-evaluated whenever `listChangeTracker` changes - HACK
    return this.listChangeTracker ? this.list : this.list
  }
  get asArray (): Composition[] {
    return [...this.asMap.values()]
  }
  get size (): number {
    return this.asMap.size
  }
  get get (): (id:string) => Composition | undefined {
    return (id:string): Composition | undefined => this.asMap.get(id)
  }
  // USE?
  // get keys (): IterableIterator<string> {
  //   return this.asMap.keys()
  // }
  // get values (): IterableIterator<Point> {
  //   return this.asMap.values()
  // }
  // get has (): (id:string) => boolean {
  //   return (id:string): boolean => this.asMap.has(id)
  // }

  // Mutations (synchronous)
  @Mutation
  fromMap (list: Map<string, Composition>) {
    this.list = list
    // Trigger Vue updates
    this.listChangeTracker += 1
  }
  @Mutation
  set (c: Composition) {
    this.list.set(c.backgroundImage.src, c)
    this.listChangeTracker += 1
  }
  @Mutation
  delete (id: string) {
    this.list.delete(id)
    this.listChangeTracker += 1
  }
  // Actions
  // Important: actions only receive 1 argument (payload). If you want to
  // receive various arguments -> fields of an Object
  @Action
  fromArray (list: Composition[]) {
    this.fromMap(new Map(list.map(c => [c.backgroundImage.src, c])))
  }
  @Action
  clear () {
    this.fromMap(new Map())
  }
  @Action
  deleteSet (ids: Set<string>) {
    const newList: Map<string, Composition> = new Map(this.asMap)
    for (const id of ids) {
      newList.delete(id)
    }
    this.fromMap(newList)
  }
}
