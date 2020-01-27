// See https://championswimmer.in/vuex-module-decorators/
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import uuid from 'uuid'
import Automerge from 'automerge'
import {
  AutomergeState,
  Composition,
  Category,
  FakeMap,
  ImageSpec,
  Point,
  XYId
} from '@/types'
import {
  placeholderImageSpec,
  defaultImageSpecs,
  defaultColors
} from '@/utils/defaults.ts'
import {
  goToComposition
} from '@/utils/router.ts'
import {
  backgroundImageStore,
  pointsMetricsStore,
  pointsSelectionStore,
  socketStore
} from '@/store/store-accessor'

const createCategories = (): { [id: string]: Category } => {
  return defaultColors.reduce((a: { [id: string]: Category }, c: string) => {
    const id: string = uuid.v4()
    a[id] = { id, color: c }
    return a
  }, {})
}

const imageSpecToComposition = (imageSpec: ImageSpec): Composition => {
  return {
    id: uuid.v4(),
    backgroundImage: imageSpec,
    categories: createCategories(),
    points: {}
  }
}

const getRandomElement = (arr: any[]): string => {
  return arr[Math.floor(Math.random() * arr.length)]
}

const initFromDefaults = (imageSpecs: ImageSpec[]): AutomergeState => {
  return Automerge.change<AutomergeState>(
    Automerge.init<AutomergeState>(),
    doc => {
      doc.compositions = {}
      for (const imageSpec of imageSpecs) {
        const c: Composition = imageSpecToComposition(imageSpec)
        doc.compositions[c.id] = c
      }

      // slice(1): to remove the first image (placeholder)
      const ids = Object.keys(doc.compositions).slice(1)
      doc.currentId = getRandomElement(ids)
    }
  )
}

const defaultState = initFromDefaults([
  placeholderImageSpec,
  ...defaultImageSpecs
])

@Module({ name: 'compositions', namespaced: true })
export default class CompositionsModule extends VuexModule {
  // State - state of truth - meant to be exported as a JSON - init definitions
  automergeState: AutomergeState = defaultState

  // Getters - cached, not meant to be exported
  get compositions (): FakeMap<Composition> {
    return this.automergeState.compositions
  }
  get currentId (): string {
    return this.automergeState.currentId
  }
  get asArray (): Composition[] {
    return Object.values(this.compositions)
  }
  get get (): (id: string) => Composition | undefined {
    return (id: string): Composition | undefined => this.compositions[id]
  }
  get current (): Composition {
    const c: Composition | undefined = this.get(this.currentId)
    if (c === undefined) {
      throw new RangeError(
        'No current composition has been found. The compositions store should always provide a current composition'
      )
    }
    return c
  }
  get has (): (id: string) => boolean {
    return (id: string): boolean => this.compositions[id] !== undefined
  }

  // Mutations (synchronous)
  @Mutation
  setAutomergeState (automergeState: AutomergeState) {
    this.automergeState = automergeState
  }
  // Actions
  // Important: actions only receive 1 argument (payload). If you want to
  // receive various arguments -> fields of an Object
  @Action
  async resetAutomergeState (automergeState: AutomergeState) {
    const newComposition = automergeState.compositions[automergeState.currentId]

    // Update the background image (if required)
    // an exception will throw if the image cannot be loaded
    await backgroundImageStore.update(newComposition.backgroundImage)

    // Clear the temporary data
    if (newComposition.id !== this.currentId) {
      pointsSelectionStore.clear()
    }
    // Always? Maybe it's quicker to test if the points have been modified
    pointsMetricsStore.clear()

    this.setAutomergeState(automergeState)

    // Update the URL
    goToComposition(this.current)
  }
  @Action
  async applyAutomergeChanges (changes: Automerge.Change[]) {
    const newState = Automerge.applyChanges(this.automergeState, changes)
    await this.resetAutomergeState(newState)
  }
  @Action
  appendCompositionFromImageSpec (imageSpec: ImageSpec) {
    const c: Composition = imageSpecToComposition(imageSpec)

    // Register the change in automerge
    const newState = Automerge.change(this.automergeState, doc => {
      doc.compositions[c.id] = c
    })
    this.setAutomergeState(newState)
  }
  @Action updateAutomergeState (newState: AutomergeState) {
    try {
      const changes = Automerge.getChanges(this.automergeState, newState)
      socketStore.emitUpdateState(changes)
    } catch (e) {
      throw new Error('The new state could not be set')
    }
    this.setAutomergeState(newState)

    // Update the URL
    goToComposition(this.current)
  }
  @Action({ rawError: true })
  async updateCurrentComposition (newComposition: Composition) {
    // Update the background image
    // an exception will throw if the image cannot be loaded
    await backgroundImageStore.update(newComposition.backgroundImage)

    // Clear the temporary data
    if (newComposition.id !== this.currentId) {
      pointsSelectionStore.clear()
    }
    pointsMetricsStore.clear()

    // Register the change in automerge
    const newState = Automerge.change(this.automergeState, doc => {
      doc.compositions[newComposition.id] = newComposition
      doc.currentId = newComposition.id
    })
    this.updateAutomergeState(newState)
  }
  @Action
  deletePoints (ids: Set<string>) {
    const newState = Automerge.change(this.automergeState, doc => {
      for (const id of ids.values()) {
        delete doc.compositions[this.currentId].points[id]
      }
    })
    this.updateAutomergeState(newState)
  }
  @Action
  movePoint ({ id, x, y }: XYId) {
    const newState = Automerge.change(this.automergeState, doc => {
      doc.compositions[this.currentId].points[id].x = x
      doc.compositions[this.currentId].points[id].y = y
    })
    this.updateAutomergeState(newState)
  }
  @Action
  appendPoint (point: Point) {
    const newState = Automerge.change(this.automergeState, doc => {
      doc.compositions[this.currentId].points[point.id] = point
    })
    this.updateAutomergeState(newState)
  }
}
