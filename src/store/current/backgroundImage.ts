// Current background image

// See https://championswimmer.in/vuex-module-decorators/
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import { fetchImage } from '@/utils/img.ts'
import { ImageSpec } from '@/types'

import store from '@/store'

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
  async update (imageSpec: ImageSpec) {
    // this.setNotReady()
    try {
      if (imageSpec.src !== this.image.src || imageSpec.srcset !== this.image.srcset) {
        // if the background image has changed, try to update it
        this.setImage(await fetchImage(imageSpec))
      }
    } catch (e) {
      throw new ReferenceError('Background image could not be loaded')
    }
    this.setReady()
  }
}
