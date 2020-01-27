import { Category, Composition, Point, UrlQuery, UrlQuerySpec, UrlQuerySpecPt, UrlQuerySpecCat } from '@/types'
import router from '@/router'

const specToQuery = (query: UrlQuerySpec): UrlQuery => {
  return {
    id: query.id,
    img: query.img,
    cats: JSON.stringify(query.cats),
    pts: JSON.stringify(query.pts)
  }
}

export const goTo = (spec: UrlQuerySpec) => {
  router.push({ query: specToQuery(spec) })
}

export const goToComposition = (composition: Composition) => {
  goTo(compositionToUrlQuerySpec(composition))
}

const pointToUrlQuerySpecPt = (p: Point): UrlQuerySpecPt => {
  // TODO: force the points to be associed to a category?
  return {
    id: p.id,
    n: p.number,
    x: p.x,
    y: p.y,
    c: p.categoryId || ''
  }
}
const pointToUrlQuerySpecCat = (c: Category): UrlQuerySpecCat => {
  return {
    id: c.id,
    c: c.color
  }
}

export const compositionToUrlQuerySpec = (c: Composition): UrlQuerySpec => {
  return {
    id: c.id,
    img: c.backgroundImage.exportableSrc,
    cats: Object.values(c.categories).map(pointToUrlQuerySpecCat),
    pts: Object.values(c.points).map(pointToUrlQuerySpecPt)
  }
}
