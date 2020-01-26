// See https://championswimmer.in/vuex-module-decorators/
import { Action, Module, Mutation, VuexModule, getModule } from 'vuex-module-decorators'
import uuid from 'uuid'
import store from '@/store'
import { Composition, Category, ImageSpec, Point } from '@/types'
import { fieldsToComposition } from '@/utils/composition.ts'
import { getExportableSrc } from '@/utils/img.ts'
import {
  defaultImageSpecs,
  defaultCategories,
  defaultPoints
} from '@/utils/defaults.ts'
import BackgroundImage from '@/store/current/backgroundImage.ts'
import PointsMetrics from '@/store/current/pointsMetrics.ts'
import PointsSelection from '@/store/current/pointsSelection.ts'

const backgroundImage = getModule(BackgroundImage)
const pointsMetrics = getModule(PointsMetrics)
const pointsSelection = getModule(PointsSelection)

const initFromDefaults = (
  defaultImageSpecs: ImageSpec[],
  defaultCategories: Category[],
  defaultPoints: Point[]
): Composition[] => {
  if (defaultImageSpecs.length === 0) {
    throw new RangeError('The list of default images must contain at least one element.')
  }
  // Set the initial list of compositions
  return defaultImageSpecs.map(imageSpec => fieldsToComposition(
    uuid.v4(),
    imageSpec,
    defaultCategories,
    defaultPoints
  ))
}

const defaultCompositions = initFromDefaults(
  defaultImageSpecs,
  defaultCategories,
  defaultPoints
)

const initialId = defaultCompositions[Math.floor(Math.random() * defaultCompositions.length)].id

@Module({ dynamic: true, store, name: 'compositions', namespaced: true })
export default class Compositions extends VuexModule {
  // State - state of truth - meant to be exported as a JSON - init definitions
  // Currently: 1-to-1 correspondance between pictures and compositions
  // TODO allow various compositions for a given picture?

  list: Map<string, Composition> = new Map(defaultCompositions.map(c => [c.id, c]))
  listChangeTracker: number = 1
  currentId: string = initialId

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
  get current (): Composition {
    const c: Composition | undefined = this.get(this.currentId)
    if (c === undefined) {
      throw new RangeError('No current composition has been found. The compositions store should always provide a current composition')
    }
    return c
  }
  get default (): Composition {
    const c: Composition | undefined = this.get(initialId)
    if (c === undefined) {
      // TODO: it could throw if we add the option to delete compositions
      throw new RangeError('No default composition has been found. The compositions store should always provide a default composition')
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
  async appendFromDataUrl (dataUrl: string) {
    // Nothing to do if a composition already exists with the same identifier
    // TODO: alternatives: replace it, merge it, or append it to an array of multiple compositions for the same image
    const mode: string = 'ignoreIfExists'
    if (this.has(dataUrl) && mode === 'ignoreIfExists') {
      return
    }
    // TODO: also generate a thumbnail for the gallery
    this.set(fieldsToComposition(uuid.v4(), { src: dataUrl, exportableSrc: await getExportableSrc(dataUrl) }))
  }
  @Action
  async updateCurrentComposition (newComposition: Composition) {
    // Update the background image
    // an exception will throw if the image cannot be loaded
    await backgroundImage.update(newComposition.backgroundImage)

    // Clear the temporary data
    pointsSelection.clear()
    pointsMetrics.clear()

    // Send the composition to the socket
    // socket.updateComposition(compositions.current)

    // Update the list of compositions (will replace an existing composition
    // if an id matches, or append a new one)
    this.set(newComposition)
    // Set as the current composition
    this.setCurrentId(newComposition.id)
  }
  @Action
  updateCurrentPoints (points: Point[]) {
    this.set({ ...this.current, points })
  }
}
