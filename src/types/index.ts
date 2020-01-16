import { Route } from 'vue-router/types/router'

// Images
export interface ImageSpec {
  src: string
  srcset?: string
  thumbnailSrc?: string
  localId?: string
}

// Points
export interface XY {
  x: number
  y: number
}
export interface XYId extends XY {
  id: string
}
export interface XYCategory extends XY {
  categoryId: string
}
export interface Point extends XYCategory {
  id: string
  number: number
}

// Categories
export interface Color {
  color: string
}
export interface Category extends Color {
  id: string
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
  name: string
  sId?: SocketIOClient.Socket['id']
  color?: string
}
