import { Route } from 'vue-router/types/router'

// Images
export interface ImageSpec {
  src: string
  srcset?: string
  thumbnailSrc?: string
  localId?: string
}

// Points
export interface XYId {
  id: string
  x: number
  y: number
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
  points: Point[]
  categories: Category[]
}

// URL Query Specification (the data required to forge an URL query)
export interface UrlQuerySpec {
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
