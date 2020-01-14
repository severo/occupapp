// Methods to manage the URL query string
import { getModule } from 'vuex-module-decorators'

import {
  Category,
  Composition,
  ImageSpec,
  Point,
  UrlQuery
} from '@/utils/types.ts'
import { validateImageSpec } from '@/utils/img.ts'
import { goTo } from '@/utils/router.ts'
import {
  compositionToUrlQuerySpec,
  fieldsToComposition
} from '@/utils/composition.ts'

import Compositions from '@/store/compositions.ts'
import GalleryImages from '@/store/galleryImages.ts'

const compositions = getModule(Compositions)
const galleryImages = getModule(GalleryImages)

export const goToImageSpec = (imageSpec: ImageSpec) => {
  const c: Composition | undefined = compositions.getByImageSpec(imageSpec)
  if (c === undefined) {
    goToComposition(fieldsToComposition(imageSpec))
  } else {
    goToComposition(c)
  }
}

export const goToComposition = (c: Composition) => {
  goTo(compositionToUrlQuerySpec(c))
}

export const goToCurrentComposition = () => {
  goToComposition(compositions.current)
}

// Check the img parameter in the query
// It can be:
// - an image src, eg: `https://github.com/severo/pictures/raw/master/images,w_1920/petanque.jpg`
// - a local identifier, eg: `local:55188aa7-cf93-47ed-a083-56b627e835c4`
const parseImageSpec = async (
  query: UrlQuery
): Promise<ImageSpec | undefined> => {
  // First: ensure there is an img parameter
  if (query.img !== undefined && typeof query.img === 'string') {
    const imageId: string = query.img

    // is it already in the gallery?
    const im: ImageSpec | undefined = galleryImages.get(imageId)
    if (im !== undefined) {
      return im
    }

    // or is it a valid image URL?
    const newIm: ImageSpec = { src: imageId }
    if (await validateImageSpec(newIm)) {
      return newIm
    }
  }
}

const parseCategories = (query: UrlQuery): Category[] | undefined => {
  // First: ensure there is a cats field
  if (query.cats !== undefined && typeof query.cats === 'string') {
    const cats = JSON.parse(query.cats)
    const arr: Category[] = []
    if (Array.isArray(cats)) {
      for (const c of cats) {
        // TODO: add more validation (uuid length? color formats?)
        if (
          c.id !== undefined && typeof c.id === 'string' &&
          c.c !== undefined && typeof c.c === 'string'
        ) {
          arr.push({ id: c.id, color: c.c })
        }
      }
      return arr
      // in any other case: returns undefined
    }
  }
}

const parsePoints = (query: UrlQuery): Point[] | undefined => {
  // First: ensure there is a pts field
  if (query.pts !== undefined && typeof query.pts === 'string') {
    const pts = JSON.parse(query.pts)
    const arr: Point[] = []
    if (Array.isArray(pts)) {
      for (const p of pts) {
        // TODO: add more validation (domain of x and y, positive number)
        if (
          p.id !== undefined && typeof p.id === 'string' &&
          p.n !== undefined && typeof p.n === 'number' &&
          p.x !== undefined && typeof p.x === 'number' &&
          p.y !== undefined && typeof p.y === 'number' &&
          p.c !== undefined && typeof p.c === 'string'
        ) {
          arr.push({ id: p.id, number: p.n, x: p.x, y: p.y, categoryId: p.c })
        }
      }
      return arr
      // in any other case: returns undefined
    }
  }
}

export const parse = async (query: UrlQuery): Promise<Composition | undefined> => {
  // The query arguments are parsed and validated in order: imageSpec, then categories, then points.
  // If an argument is invalid, it's fixed and the URL is modified (the process stops here)
  // Else, if all arguments are OK, the state is updated

  const imageSpec: ImageSpec | undefined = await parseImageSpec(query)
  if (imageSpec === undefined) {
    goToCurrentComposition()
    return
  }

  const cats: Category[] | undefined = parseCategories(query)
  if (cats === undefined) {
    // categories should have been valid
    // first option to fix them: load an existing composition for imageSpec and restore it
    // second option: create a new composition for imageSpec with default values and load it
    goToComposition(
      compositions.getByImageSpec(imageSpec) || fieldsToComposition(imageSpec)
    )
    return
  }

  const pts: Point[] | undefined = parsePoints(query)
  if (pts === undefined) {
    // points should have been valid
    // first option to fix them: load an existing composition for imageSpec and restore it
    // second option: create a new composition for imageSpec and categories, and load it
    goToComposition(
      compositions.getByImageSpec(imageSpec) || fieldsToComposition(imageSpec, cats)
    )
    return
  }

  // If some points refer to a non-existing category, remove the points and reload
  const catsIds = cats.map(c => c.id)
  const hasValidCategoryId = (p: Point): boolean => catsIds.includes(p.categoryId)
  if (pts.some(p => !hasValidCategoryId(p))) {
    const newPts = pts.filter(hasValidCategoryId)
    goToComposition(fieldsToComposition(imageSpec, cats, newPts))
  }

  // All the fields of the composition are valid
  return fieldsToComposition(imageSpec, cats, pts)
}
