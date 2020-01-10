// Current categories

// See https://championswimmer.in/vuex-module-decorators/
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'
import uuid from 'uuid'
import * as d3 from 'd3'
import { Color, Category } from '@/utils/types.ts'

const defaultId = uuid.v4()
const defaultColor = d3.rgb(0, 0, 0, 0.3)
const defaultPalette = [d3.rgb(255, 195, 8), d3.rgb(172, 159, 253), d3.rgb(181, 246, 66), d3.rgb(239, 106, 222)]
const defaultArray: Category[] = defaultPalette.map(c => {
  return { id: uuid.v4(), color: c.hex() }
})
const defaultMap: Map<string, Category> = new Map(defaultArray.map(c => {
  return [c.id, c]
}))

@Module({ dynamic: true, store, name: 'categories', namespaced: true })
export default class Categories extends VuexModule {
  // IMPORTANT. We use a hack to add Vue reactivity to Map and Set objects
  // See https://stackoverflow.com/a/45441321/7351594

  // State - state of truth - meant to be exported as a JSON - init definitions
  list: Map<string, Category> = defaultMap
  listChangeTracker: number = 1
  currentCategoryId: string = defaultId

  default: Category = {
    id: defaultId,
    // Note .hex() will be obsolete in d3-color, see https://github.com/d3/d3-color#color_formatHex and https://www.npmjs.com/package/@types/d3
    color: defaultColor.hex()
  }

  // Getters - cached, not meant to be exported
  get defaultId (): string {
    return this.default.id
  }
  get defaultMap (): Map<string, Category> {
    return defaultMap
  }
  get defaultArray (): Category[] {
    return defaultArray
  }
  get asMap (): Map<string, Category> {
    // By using `listChangeTracker` we tell Vue that this property depends on it,
    // so it gets re-evaluated whenever `listChangeTracker` changes - HACK
    return this.listChangeTracker ? this.list : this.list
  }
  get asArray (): Category[] {
    return [...this.asMap.values()]
  }
  get size (): number {
    return this.asMap.size
  }
  get get (): (id:string) => Category {
    return (id:string): Category => this.asMap.get(id) || this.default
  }
  get keys (): IterableIterator<string> {
    return this.asMap.keys()
  }
  get keysArray (): string[] {
    return [...this.keys]
  }
  // USE?
  // get values (): IterableIterator<Point> {
  //   return this.asMap.values()
  // }
  // get has (): (id:string) => boolean {
  //   return (id:string): boolean => this.asMap.has(id)
  // }
  get getColor (): (id: string | undefined) => string {
    return (id: string | undefined): string => this.get(id || '').color || this.default.color
  }

  // Mutations (synchronous)
  @Mutation
  fromMap (list: Map<string, Category>) {
    this.list = list
    // Trigger Vue updates
    this.listChangeTracker += 1
  }
  @Mutation
  set (category: Category) {
    this.list.set(category.id, category)
    this.listChangeTracker += 1
  }
  @Mutation
  delete (id: string) {
    this.list.delete(id)
    this.listChangeTracker += 1
  }
  @Mutation
  setCurrentCategoryId (id: string) {
    this.currentCategoryId = id
  }

  // Actions
  @Action
  fromArray (list: Category[]) {
    this.fromMap(new Map(list.map(p => [p.id, p])))
  }
  @Action
  clear () {
    this.fromMap(new Map())
  }
  @Action
  post (c: Color) {
    const newCategory = { id: uuid.v4(), ...c }
    this.set(newCategory)
  }
  @Action
  deleteSet (ids: Set<string>) {
    const newList: Map<string, Category> = new Map(this.asMap)
    for (const id of ids) {
      newList.delete(id)
    }
    this.fromMap(newList)
  }
  @Action
  setColor (id: string, color: string) {
    const category = this.asMap.get(id)
    if (category) {
      this.set({ ...category, color })
    } else {
      throw RangeError(`There is no category id=${id} in the list`)
    }
  }
  // Used to assign a category by default
  @Action
  nextId (): string {
    const keys = this.keysArray
    if (keys.length === 0) {
      return this.defaultId
    }
    const index = keys.indexOf(this.currentCategoryId)
    const nextId = keys[(index + 1) % keys.length]
    this.setCurrentCategoryId(nextId)
    return nextId
  }
}
