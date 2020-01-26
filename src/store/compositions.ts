// See https://championswimmer.in/vuex-module-decorators/
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'
import { Composition, Category, ImageSpec, Point } from '@/types'
import { fieldsToComposition } from '@/utils/composition.ts'

import {
  defaultImageSpecs,
  defaultCategories,
  defaultPoints
} from '@/utils/defaults.ts'

const initFromDefaults = (
  defaultImageSpecs: ImageSpec[],
  defaultCategories: Category[],
  defaultPoints: Point[]
): Composition[] => {
  if (defaultImageSpecs.length === 0) {
    throw new RangeError('The list of default images must contain at least one element.')
  }
  // Set the initial list of compositions
  return defaultImageSpecs.map(imageSpec => ({
    id: imageSpec.src,
    backgroundImage: imageSpec,
    categories: defaultCategories,
    points: defaultPoints
  }))
}

const defaultCompositions = initFromDefaults(
  defaultImageSpecs,
  defaultCategories,
  defaultPoints
)

@Module({ dynamic: true, store, name: 'compositions', namespaced: true })
export default class Compositions extends VuexModule {
  // State - state of truth - meant to be exported as a JSON - init definitions
  // Currently: 1-to-1 correspondance between pictures and compositions
  // TODO allow various compositions for a given picture?

  list: Map<string, Composition> = new Map(defaultCompositions.map(c => [c.id, c]))
  listChangeTracker: number = 1
  currentId: string = defaultCompositions[0].id

  // Getters - cached, not meant to be exported
  get asMap (): Map<string, Composition> {
    // By using `listChangeTracker` we tell Vue that this property depends on it,
    // so it gets re-evaluated whenever `listChangeTracker` changes - HACK
    return this.listChangeTracker ? this.list : this.list
  }
  get asArray (): Composition[] {
    return [...this.asMap.values()]
  }
  get get (): (id: string) => Composition | undefined {
    return (id: string): Composition | undefined => this.asMap.get(id)
  }
  get getByImageSpec (): (imageSpec: ImageSpec) => Composition | undefined {
    return (imageSpec: ImageSpec): Composition | undefined => imageSpec.localId ? this.get(imageSpec.localId) : this.get(imageSpec.src)
  }
  get current (): Composition {
    const c: Composition | undefined = this.get(this.currentId)
    if (c === undefined) {
      throw new RangeError('No current composition has been found. The compositions store should always provide a current composition')
    }
    return c
  }
  get has (): (id: string) => boolean {
    return (id: string): boolean => this.asMap.has(id)
  }

  // Mutations (synchronous)
  @Mutation
  set (c: Composition) {
    this.list.set(c.id, c)
    this.listChangeTracker += 1
  }
  @Mutation
  setCurrentId (id: string) {
    this.currentId = id
  }
  // Actions
  // Important: actions only receive 1 argument (payload). If you want to
  // receive various arguments -> fields of an Object
  @Action
  setCurrent (composition: Composition) {
    // Update the list of compositions
    this.set(composition)
    // Set the current id
    this.setCurrentId(composition.id)
  }

  @Action
  appendFromImageSpec (imageSpec: ImageSpec) {
    // Nothing to do if a composition already exists with the same identifier
    // TODO: alternatives: replace it, merge it, or append it to an array of multiple compositions for the same image
    const mode: string = 'ignoreIfExists'
    if (this.has(imageSpec.src) && mode === 'ignoreIfExists') {
      return
    }

    this.set(fieldsToComposition(imageSpec))
  }
  @Action
  setCurrentPoints (points: Point[]) {
    this.set({ ...this.current, points })
  }
  @Action
  setCurrentCategories (categories: Category[]) {
    this.set({ ...this.current, categories })
  }
}
