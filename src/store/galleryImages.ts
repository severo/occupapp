// See https://championswimmer.in/vuex-module-decorators/
import uuid from 'uuid'
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'
import { ImageSrc } from '@/utils/types.ts'
import { imageSrcs } from '@/utils/severo_pictures.ts'
import { getImageUrl } from '@/utils/img.ts'

const arrayToMap = (arr: ImageSrc[]): Map<string, ImageSrc> => {
  return new Map(arr.map(s => [s.src, s]))
}
@Module({ dynamic: true, store, name: 'galleryImages', namespaced: true })
export default class GalleryImages extends VuexModule {
  // State - state of truth - meant to be exported as a JSON - init definitions
  list: Map<string, ImageSrc> = arrayToMap(imageSrcs)
  listChangeTracker: number = 1

  // Getters - cached, not meant to be exported
  get asMap (): Map<string, ImageSrc> {
    // By using `listChangeTracker` we tell Vue that this property depends on it,
    // so it gets re-evaluated whenever `listChangeTracker` changes - HACK
    return this.listChangeTracker ? this.list : this.list
  }
  get asArray (): ImageSrc[] {
    return [...this.asMap.values()]
  }
  get size (): number {
    return this.asMap.size
  }
  get get (): (id:string) => ImageSrc | undefined {
    return (id:string): ImageSrc | undefined => this.asMap.get(id)
  }
  get defaultSrc (): string {
    return this.size ? this.asArray[0].src : ''
  }
  get asLocalIdMap (): Map<string, ImageSrc> {
    // Only contains the locally uploaded images, with the localId string as
    // the key
    return new Map(
      this.asArray
        .filter(i => 'localId' in i && i.localId !== undefined)
        .map(i => [i.localId || 'shouldneverbeused', i])
    )
  }
  // USE?
  // get keys (): IterableIterator<string> {
  //   return this.asMap.keys()
  // }
  // get values (): IterableIterator<Point> {
  //   return this.asMap.values()
  // }
  get has (): (id:string) => boolean {
    return (id:string): boolean => this.asMap.has(id)
  }

  // Mutations (synchronous)
  @Mutation
  fromMap (list: Map<string, ImageSrc>) {
    this.list = list
    // Trigger Vue updates
    this.listChangeTracker += 1
  }
  @Mutation
  set (s: ImageSrc) {
    this.list.set(s.src, s)
    this.listChangeTracker += 1
  }
  @Mutation
  delete (id: string) {
    this.list.delete(id)
    this.listChangeTracker += 1
  }
  // Actions
  // Important: actions only receive 1 argument (payload). If you want to
  // receive various arguments -> fields of an Object
  @Action
  fromArray (list: ImageSrc[]) {
    this.fromMap(arrayToMap(list))
  }
  @Action
  appendSrc (src: string) {
    this.set({ src })
  }
  @Action
  appendArray (list: ImageSrc[]) {
    for (const s of list) {
      this.set(s)
    }
  }
  @Action
  async appendFilesArray (files: File[]) {
    const list: ImageSrc[] = []
    for (const f of files) {
      const base64Str = await getImageUrl(f)
      if (base64Str !== '') {
        list.push({ src: base64Str, localId: `local:${uuid.v4()}` })
      }
    }
    this.appendArray(list)
  }
  @Action
  clear () {
    this.fromMap(new Map())
  }
  @Action
  deleteSet (ids: Set<string>) {
    const newList: Map<string, ImageSrc> = new Map(this.asMap)
    for (const id of ids) {
      newList.delete(id)
    }
    this.fromMap(newList)
  }
}
