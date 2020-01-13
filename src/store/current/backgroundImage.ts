// Current background image

// See https://championswimmer.in/vuex-module-decorators/
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import { ImageSrc } from '@/utils/types.ts'
import { fetchImage } from '@/utils/img.ts'

import store from '@/store'

@Module({ dynamic: true, store, name: 'backgroundImage', namespaced: true })
export default class BackgroundImage extends VuexModule {
  // State - state of truth - meant to be exported as a JSON - init definitions
  image: HTMLImageElement = new Image()
  isReady: boolean = false
  // TODO: add thumbnailSrc?

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
  get srcset (): string {
    return this.image.srcset
  }
  get imageSrc (): ImageSrc {
    return {
      src: this.image.src,
      srcset: this.image.srcset
    }
  }

  get aspectRatio (): number {
    if (this.naturalHeight === 0) {
      return 1
    }
    return this.naturalWidth / this.naturalHeight
  }

  @Mutation
  fromHTMLImageElement (image: HTMLImageElement) {
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
  async fromImageSrc (imageSrc: ImageSrc) {
    // only update if needed
    // TODO: also check srcset, thumbnailSrc and localId?
    if (imageSrc.src === this.src) {
      return
    }
    this.setNotReady()
    this.fromHTMLImageElement(await fetchImage(imageSrc))
    this.setReady()
  }
}
