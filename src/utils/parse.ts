// Methods to manage the URL query string
import { Category, Composition, FakeMap, Point, UrlQuery } from '@/types'

const parseId = (query: UrlQuery): string | undefined => {
  // First: ensure there is an img parameter
  if (query.id !== undefined && typeof query.id === 'string') {
    return query.id
  }
}
// Check the img parameter in the query
// It can be:
// - an image src, eg: `https://github.com/severo/pictures/raw/master/images,w_1920/petanque.jpg`
// - a base64 data URL, eg: `data:image/jpeg;base64,/9j/4AAQSkZJR...`
const parseImageSpec = (query: UrlQuery): string | undefined => {
  // First: ensure there is an img parameter
  if (query.img !== undefined && typeof query.img === 'string') {
    return query.img
  }
}

const parseCategories = (query: UrlQuery): FakeMap<Category> | undefined => {
  // First: ensure there is a cats field
  if (query.cats !== undefined && typeof query.cats === 'string') {
    const cats = JSON.parse(query.cats)
    const catsMap: FakeMap<Category> = {}
    for (const c of cats) {
      // TODO: add more validation (uuid length? color formats?)
      if (
        c.id !== undefined &&
        typeof c.id === 'string' &&
        c.c !== undefined &&
        typeof c.c === 'string'
      ) {
        catsMap[c.id] = { id: c.id, color: c.c }
      }
    }
    return catsMap
  }
}

const parsePoints = (query: UrlQuery): FakeMap<Point> | undefined => {
  // First: ensure there is a pts field
  if (query.pts !== undefined && typeof query.pts === 'string') {
    const pts = JSON.parse(query.pts)
    const ptsMap: FakeMap<Point> = {}
    for (const p of pts) {
      // TODO: add more validation (domain of x and y, positive number)
      if (
        p.id !== undefined &&
        typeof p.id === 'string' &&
        p.n !== undefined &&
        typeof p.n === 'number' &&
        p.x !== undefined &&
        typeof p.x === 'number' &&
        p.y !== undefined &&
        typeof p.y === 'number' &&
        p.c !== undefined &&
        typeof p.c === 'string'
      ) {
        ptsMap[p.id] = {
          id: p.id,
          number: p.n,
          x: p.x,
          y: p.y,
          categoryId: p.c
        }
      }
    }
    return ptsMap
  }
}

export const parse = (query: UrlQuery): Composition | undefined => {
  const id: string | undefined = parseId(query)
  const src: string | undefined = parseImageSpec(query)
  const cats: FakeMap<Category> | undefined = parseCategories(query)
  const pts: FakeMap<Point> | undefined = parsePoints(query)
  if (
    id === undefined &&
    src === undefined &&
    cats === undefined &&
    pts === undefined
  ) {
    // Default URL - nothing to do
    return
  }
  if (
    id === undefined ||
    src === undefined ||
    cats === undefined ||
    pts === undefined
  ) {
    throw new ReferenceError('Missing URL arguments')
  }

  // If some points refer to a non-existing category, throw
  const catsIds = Object.keys(cats)
  const hasValidCategoryId = (p: Point): boolean =>
    catsIds.includes(p.categoryId)
  if (Object.values(pts).some(p => !hasValidCategoryId(p))) {
    throw new RangeError("Some points in the URL don't match a category")
  }

  // replacing ' ' by '+' seems to be required when pasting a data URL
  // (https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs)
  // in the 'img=xxx' query parameter
  const fixedSrc: string = src.replace(/ /g, '+')

  // All the fields of the composition seem to be valid
  return {
    id,
    backgroundImage: { src: fixedSrc, exportableSrc: fixedSrc },
    categories: cats,
    points: pts
  }
}
