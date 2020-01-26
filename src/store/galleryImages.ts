// See https://championswimmer.in/vuex-module-decorators/
import uuid from 'uuid'
import { Action, Module, VuexModule, getModule } from 'vuex-module-decorators'
import store from '@/store'
import { ImageSpec } from '@/types'
import { getImageUrl } from '@/utils/img.ts'

import Compositions from '@/store/compositions.ts'
const compositions = getModule(Compositions)

@Module({ dynamic: true, store, name: 'galleryImages', namespaced: true })
export default class GalleryImages extends VuexModule {
  // No inner state - the data is saved in compositions

  // Getters - cached, not meant to be exported
  get asSet (): Set<ImageSpec> {
    // By using `listChangeTracker` we tell Vue that this property depends on it,
    // so it gets re-evaluated whenever `listChangeTracker` changes - HACK
    return new Set(compositions.asArray.map(c => c.backgroundImage))
  }
  get asArray (): ImageSpec[] {
    return [...this.asSet.values()]
  }
  get asMap (): Map<string, ImageSpec> {
    return new Map(this.asArray.map(i => [i.localId || i.src, i]))
  }
  get size (): number {
    return this.asSet.size
  }
  get get (): (id:string) => ImageSpec | undefined {
    return (id:string): ImageSpec | undefined => this.asMap.get(id)
  }

  // Actions
  // Important: actions only receive 1 argument (payload). If you want to
  // receive various arguments -> fields of an Object
  @Action
  async appendFromFiles (files: File[]) {
    for (const f of files) {
      const base64Str = await getImageUrl(f)
      if (base64Str !== '') {
        compositions.appendFromImageSpec({ src: base64Str, localId: `local:${uuid.v4()}` })
      }
    }
  }
}
