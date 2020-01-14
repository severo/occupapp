import { getModule } from 'vuex-module-decorators'
import { Composition, ImageSrc } from '@/utils/types.ts'
import router from '@/router'
import GalleryImages from '@/store/galleryImages.ts'
import BackgroundImage from '@/store/current/backgroundImage.ts'
import Categories from '@/store/current/categories.ts'
import Points from '@/store/current/points.ts'
const galleryImages = getModule(GalleryImages)
const backgroundImage = getModule(BackgroundImage)
const categories = getModule(Categories)
const points = getModule(Points)

export const persistState = () => {
  const imageSrc: ImageSrc | undefined = galleryImages.get(backgroundImage.src)
  if (imageSrc !== undefined) {
    goTo({
      backgroundImage: imageSrc,
      categories: categories.asArray,
      points: points.asArray
    })
  } else {
    throw new RangeError(`Background image ${backgroundImage.src} not found in the gallery.`)
  }
}

export const goTo = (c: Composition) => {
  router.push({
    query: {
      imageSrc: c.backgroundImage.localId || c.backgroundImage.src,
      categories: JSON.stringify(c.categories),
      points: JSON.stringify(c.points)
    }
  })
}
