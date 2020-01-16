import { Category, Composition, ImageSpec, Point, UrlQuerySpec, UrlQuerySpecPt, UrlQuerySpecCat } from '@/types'
import { defaultCategories, defaultPoints } from '@/utils/defaults.ts'

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
    img: c.backgroundImage.localId || c.backgroundImage.src,
    cats: c.categories.map(pointToUrlQuerySpecCat),
    pts: c.points.map(pointToUrlQuerySpecPt)
  }
}
export const fieldsToComposition = (imageSpec: ImageSpec, categories: Category[] = defaultCategories, points: Point[] = defaultPoints): Composition => {
  return {
    id: imageSpec.localId || imageSpec.src,
    backgroundImage: imageSpec,
    categories,
    points
  }
}
