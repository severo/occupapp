// Current background image

// See https://championswimmer.in/vuex-module-decorators/
import { Action, Module, Mutation, VuexModule, getModule } from 'vuex-module-decorators'
import { fetchImage } from '@/utils/img.ts'
import store from '@/store'

import Compositions from '@/store/compositions.ts'
const compositions = getModule(Compositions)

@Module({ dynamic: true, store, name: 'backgroundImage', namespaced: true })
export default class BackgroundImage extends VuexModule {
  // State - state of truth - meant to be exported as a JSON - init definitions
  image: HTMLImageElement = new Image()
  isReady: boolean = false

  // Getters - cached, not meant to be exported
  get naturalWidth (): number {
    return this.image.naturalWidth
  }
  get naturalHeight (): number {
    return this.image.naturalHeight
  }
  get src (): string {
    return this.image.src
  }

  get aspectRatio (): number {
    if (this.naturalHeight === 0) {
      return 1
    }
    return this.naturalWidth / this.naturalHeight
  }

  @Mutation
  setImage (image: HTMLImageElement) {
    this.image = image
  }
  @Mutation
  setNotReady () {
    this.isReady = false
  }
  @Mutation
  setReady () {
    this.isReady = true
  }

  @Action
  async refresh () {
    this.setNotReady()
    this.setImage(await fetchImage(compositions.current.backgroundImage))
    this.setReady()
  }
}
