// Current categories

// See https://championswimmer.in/vuex-module-decorators/
import { Action, Module, VuexModule, getModule } from 'vuex-module-decorators'
import store from '@/store'
import uuid from 'uuid'
import { Color, Category } from '@/utils/types.ts'

import Compositions from '@/store/compositions.ts'
const compositions = getModule(Compositions)

@Module({ dynamic: true, store, name: 'categories', namespaced: true })
export default class Categories extends VuexModule {
  // State - state of truth - meant to be exported as a JSON - init definitions

  // Getters - cached, not meant to be exported
  get asArray (): Category[] {
    return compositions.current.categories
  }
  get asMap (): Map<string, Category> {
    return new Map(this.asArray.map(c => [c.id, c]))
  }
  get size (): number {
    return this.asMap.size
  }
  get keys (): IterableIterator<string> {
    return this.asMap.keys()
  }
  get keysArray (): string[] {
    return [...this.keys]
  }
  get getColor (): (id: string) => string {
    return (id: string) : string => {
      const category = this.asMap.get(id)
      if (category === undefined) {
        throw new RangeError(`No category found with id=${id}`)
      }
      return category.color
    }
  }

  // Actions
  @Action
  setCategories (categories: Category[]) {
    compositions.setCurrentCategories(categories)
  }
  @Action
  setCategory (category: Category) {
    this.setCategories([...this.asArray, category])
  }
  @Action
  clear () {
    this.setCategories([])
  }
  @Action
  post (c: Color) {
    const newCategory = { id: uuid.v4(), ...c }
    this.setCategory(newCategory)
  }
  @Action
  deleteSet (ids: Set<string>) {
    this.setCategories(this.asArray.filter(p => !ids.has(p.id)))
  }
  @Action
  setColor (id: string, color: string) {
    const category = this.asMap.get(id)
    if (category === undefined) {
      throw RangeError(`There is no category id=${id} in the list`)
    } else {
      this.setCategory({ ...category, color })
    }
  }
}
