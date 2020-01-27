// Current categories

// See https://championswimmer.in/vuex-module-decorators/
import { Module, VuexModule } from 'vuex-module-decorators'
import { Category } from '@/types'

import { compositionsStore } from '@/store/store-accessor'

@Module({ name: 'categories', namespaced: true })
export default class CategoriesModule extends VuexModule {
  // State - state of truth - meant to be exported as a JSON - init definitions

  // Getters - cached, not meant to be exported
  get asArray (): Category[] {
    return Object.values(compositionsStore.current.categories)
  }
  get asMap (): Map<string, Category> {
    return new Map(this.asArray.map(c => [c.id, c]))
  }
  get size (): number {
    return this.asMap.size
  }
  get getColor (): (id: string) => string {
    return (id: string): string => {
      const category = this.asMap.get(id)
      if (category === undefined) {
        throw new RangeError(`No category found with id=${id}`)
      }
      return category.color
    }
  }
}
