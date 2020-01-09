// Current composition

// See https://championswimmer.in/vuex-module-decorators/
import { getModule, Action, Module, VuexModule } from 'vuex-module-decorators'
import store from '@/store'

import { ExportableComposition } from '@/utils/types.ts'

import BackgroundImage from '@/store/current/backgroundImage.ts'
import Categories from '@/store/current/categories.ts'
import ExportableCompositions from '@/store/exportableCompositions.ts'
import Points from '@/store/current/points.ts'
import PointsMetrics from '@/store/current/pointsMetrics.ts'
import PointsSelection from '@/store/current/pointsSelection.ts'

const backgroundImage = getModule(BackgroundImage)
const categories = getModule(Categories)
const exportableCompositions = getModule(ExportableCompositions)
const points = getModule(Points)
const pointsMetrics = getModule(PointsMetrics)
const pointsSelection = getModule(PointsSelection)

@Module({ dynamic: true, store, name: 'composition', namespaced: true })
export default class Composition extends VuexModule {
  @Action
  saveComposition () {
    // Save the current composition to exportableCompositions
    const c = {
      backgroundImage: backgroundImage.imageSrc,
      points: points.asArray,
      categories: categories.asArray
    }
    exportableCompositions.set(c)
  }

  @Action
  async fromExportableComposition (c: ExportableComposition) {
    // Set the image
    await backgroundImage.fromImageSrc(c.backgroundImage)
    // TODO: validate the correspondance between point.categoryId and categories
    points.fromArray(c.points)
    categories.fromArray(c.categories)
    pointsMetrics.clear()
    pointsSelection.clear()
  }

  @Action
  async fromSrcOnly (src: string) {
    // TODO: some checks on src?
    await this.fromExportableComposition({
      backgroundImage: { src },
      points: [],
      categories: categories.defaultArray
    })
  }

  @Action
  async fromSrc (src: string) {
    // Nothing to do if the same image has been selected
    if (backgroundImage.src !== src) {
      this.saveComposition()
      const c = exportableCompositions.get(src)
      if (c !== undefined) {
        await this.fromExportableComposition(c)
      } else {
        await this.fromSrcOnly(src)
      }
    }
  }
}
