import { Route } from 'vue-router/types/router'

export type FakeMap<T> = {[id: string]: T}

// See https://stackoverflow.com/a/51114250/7351594
// See https://github.com/automerge/automerge/blob/master/@types/automerge/index.d.ts
export type AutomergeState = import('automerge').Doc<{
  compositions: FakeMap<Composition>,
  currentId: string
}>

// Images
export interface ImageSpec {
  src: string
  exportableSrc: string
  srcset?: string
  thumbnailSrc?: string
}

// Points
export interface XY {
  x: number
  y: number
}
export interface XYId extends XY {
  id: string
}
export interface Point extends XYId {
  number: number
  categoryId: string
}

// Categories
export interface Category {
  id: string
  color: string
}

// Compositions
export interface Composition {
  id: string
  backgroundImage: ImageSpec
  points: FakeMap<Point>
  categories: FakeMap<Category>
}

// URL Query Specification (the data required to forge an URL query)
export interface UrlQuerySpec {
  id: string
  img: UrlQuerySpecImg
  pts?: UrlQuerySpecPt[]
  cats?: UrlQuerySpecCat[]
}
export type UrlQuerySpecImg = string
export interface UrlQuerySpecPt {
  id: string
  n: number
  x: number
  y: number
  c: string
}
export interface UrlQuerySpecCat {
  id: string
  c: string
}

export type UrlQuery = Route['query']

// Collaboration
export interface Guest {
  sId?: SocketIOClient.Socket['id']
  name?: string
  color?: string
}
