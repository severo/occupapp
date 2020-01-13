<template>
  <v-app id="keep">
    <v-navigation-drawer
      v-model="drawer"
      app
      right
      disable-resize-watcher
      :mobile-break-point="2*barWidth"
      :width="barWidth"
    >
      <v-toolbar light>
        <v-btn
          icon
          @click="drawer=false"
        >
          <v-icon>
            mdi-exit-to-app
          </v-icon>
        </v-btn>
        <v-toolbar-title>{{ viewTitle }}</v-toolbar-title>

        <v-spacer />
        <v-btn
          icon
          @click="view = 'points'"
          :disabled="view === 'points'"
        >
          <v-icon>mdi-map-marker-circle</v-icon>
        </v-btn>
        <v-btn
          icon
          @click="view = 'tables'"
          :disabled="view === 'tables'"
        >
          <v-icon>mdi-table-large</v-icon>
        </v-btn>
        <v-btn
          icon
          @click="view = 'images'"
          :disabled="view === 'images'"
        >
          <v-icon>mdi-image</v-icon>
        </v-btn>
        <v-btn
          icon
          @click="toggleFullscreen()"
          v-if="$vuetify.breakpoint.smAndUp"
        >
          <v-icon>mdi-fullscreen</v-icon>
        </v-btn>
        <v-app-bar-nav-icon @click="drawer = !drawer" />
      </v-toolbar>

      <v-container pa-2>
        <PointsList v-if="view === 'points'" />
        <ImagesPanel v-if="view === 'images'" />
        <TablesPanel v-if="view === 'tables'" />
      </v-container>

      <template v-slot:append>
        <v-divider />
        <Infos />
      </template>
    </v-navigation-drawer>

    <v-app-bar
      app
      clipped-right
      color="amber"
    >
      <a
        href="/"
        class="title ml-3 mr-5"
      >
        Occupapp&nbsp;<span class="font-weight-light">Voronoï</span>
      </a>
      <v-spacer />

      <v-app-bar-nav-icon @click="drawer = !drawer" />
    </v-app-bar>

    <!-- Sizes your content based upon application components -->
    <v-content>
      <v-fade-transition mode="out-in">
        <Main />
      </v-fade-transition>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'

import PointsList from '@/components/PointsList.vue'
import TablesPanel from '@/components/TablesPanel.vue'
import ImagesPanel from '@/components/ImagesPanel.vue'
import Infos from '@/components/Infos.vue'
import Main from '@/components/Main.vue'

import { validateImageSrc } from '@/utils/img.ts'
import { Category, ExportableComposition, ImageSrc, Point } from '@/utils/types.ts'

import BackgroundImage from '@/store/current/backgroundImage.ts'
import Categories from '@/store/current/categories.ts'
import ExportableCompositions from '@/store/exportableCompositions.ts'
import GalleryImages from '@/store/galleryImages.ts'
import Points from '@/store/current/points.ts'
import PointsMetrics from '@/store/current/pointsMetrics.ts'
import PointsSelection from '@/store/current/pointsSelection.ts'

const backgroundImage = getModule(BackgroundImage)
const categories = getModule(Categories)
const exportableCompositions = getModule(ExportableCompositions)
const galleryImages = getModule(GalleryImages)
const points = getModule(Points)
const pointsMetrics = getModule(PointsMetrics)
const pointsSelection = getModule(PointsSelection)

@Component({
  components: {
    PointsList,
    TablesPanel,
    ImagesPanel,
    Infos,
    Main
  }
})
export default class Home extends Vue {
  // local data
  small = 600
  big = 6000
  barWidth = 600
  drawer = false
  view = 'points'

  // computed
  get viewTitle (): string {
    const titles: Map<string, string> = new Map([
      ['tables', 'Data Tables'],
      ['images', 'Background Image'],
      ['points', 'Points']
    ])
    return titles.get(this.view) || ''
  }

  // lifecycle hook
  mounted () {
    this.small = this.$vuetify.breakpoint.thresholds.md * 0.5
    this.barWidth = this.small

    // Init the composition
    this.processQuery(this.$store.state.route.query)
  }

  // methods
  toggleFullscreen () {
    if (this.barWidth === this.small) {
      this.barWidth = this.big
    } else {
      this.barWidth = this.small
    }
  }

  async parseImageSrc (query: any): Promise<ImageSrc | undefined> {
    // First: ensure there is an imageSrc
    if ('imageSrc' in query && typeof query.imageSrc === 'string') {
      const parsed = query.imageSrc

      // is it already in the gallery?
      const im: ImageSrc | undefined = galleryImages.get(parsed)
      if (im !== undefined) {
        return im
      }

      // or is it a valid image URL?
      const newIm: ImageSrc = { src: parsed }
      if (await validateImageSrc(newIm)) {
        return newIm
      }
    }
  }

  parseCategories (query: any): Category[] | undefined {
    // First: ensure there is a categories field
    if ('categories' in query && typeof query.categories === 'string') {
      const parsed = JSON.parse(query.categories)
      const arr: Category[] = []
      if (Array.isArray(parsed)) {
        for (const c of parsed) {
          // TODO: add more validation (uuid length? color formats?)
          if ('id' in c && 'color' in c && typeof c.id === 'string' && typeof c.color === 'string') {
            arr.push({ id: c.id, color: c.color })
          }
        }
        return arr
        // in any other case: returns undefined
      }
    }
  }

  parsePoints (query: any): Point[] | undefined {
    // First: ensure there is a categories field
    if ('categories' in query && typeof query.points === 'string') {
      const parsed = JSON.parse(query.points)
      const arr: Point[] = []
      if (Array.isArray(parsed)) {
        for (const p of parsed) {
          // TODO: add more validation
          if ('id' in p && typeof p.id === 'string' &&
            'number' in p && typeof p.number === 'number' &&
            'x' in p && typeof p.x === 'number' &&
            'y' in p && typeof p.y === 'number'
          ) {
            const newPoint = { id: p.id, number: p.number, x: p.x, y: p.y }
            if ('categoryId' in p && typeof p.categoryId === 'string') {
              arr.push({ ...newPoint, categoryId: p.categoryId })
            } else {
              arr.push(newPoint)
            }
          }
        }
        return arr
        // in any other case: returns undefined
      }
    }
  }

  push (c: ExportableComposition) {
    this.$router.push({ query: {
      ...this.$store.state.route.query,
      imageSrc: c.backgroundImage.localId || c.backgroundImage.src,
      categories: JSON.stringify(c.categories),
      points: JSON.stringify(c.points)
    } })
  }

  saveComposition () {
    // Save the current composition to exportableCompositions
    const c = {
      backgroundImage: backgroundImage.imageSrc,
      categories: categories.asArray,
      points: points.asArray
    }
    exportableCompositions.set(c)
  }

  async fromExportableComposition (c: ExportableComposition) {
    // Add the image to the gallery if it were not in it
    await galleryImages.setIfNew(c.backgroundImage)
    await backgroundImage.fromImageSrc(c.backgroundImage)
    categories.fromArray(c.categories)
    points.fromArray(c.points)
    pointsMetrics.clear()
    pointsSelection.clear()
  }

  async processQuery (query: string) {
    // The query arguments are parsed and validated in order: imageSrc, then categories, then points.
    // If an argument is invalid, it's fixed and the URL is modified (the process stops here)
    // Else, if all arguments are OK, the state is updated

    const imageSrc: ImageSrc | undefined = await this.parseImageSrc(query)
    if (imageSrc === undefined) {
      // imageSrc should have been valid
      // first option to fix it: load a saved composition for the current background image
      const c: ExportableComposition | undefined = exportableCompositions.get(backgroundImage.src)
      if (c !== undefined) {
        this.push(c)
        return
      }
      // second option: load the default composition
      const defaultComposition: ExportableComposition = { backgroundImage: { src: galleryImages.defaultSrc }, categories: categories.defaultArray, points: [] }
      this.push(defaultComposition)
      return
    }

    const cats: Category[] | undefined = this.parseCategories(query)
    if (cats === undefined) {
      // categories should have been valid
      // first option to fix them: load an existing composition for imageSrc and restore it
      const c: ExportableComposition | undefined = exportableCompositions.get(imageSrc.src)
      if (c !== undefined) {
        this.push(c)
        return
      }
      // second option: create a new composition for imageSrc and load it
      const newComposition: ExportableComposition = { backgroundImage: imageSrc, categories: categories.defaultArray, points: [] }
      this.push(newComposition)
      return
    }

    const pts: Point[] | undefined = this.parsePoints(query)
    if (pts === undefined) {
      // points should have been valid
      // first option to fix them: load an existing composition for imageSrc and restore it
      const c: ExportableComposition | undefined = exportableCompositions.get(imageSrc.src)
      if (c !== undefined) {
        this.push(c)
        return
      }
      // second option: create a new composition for imageSrc and categories, and load it
      const newComposition: ExportableComposition = { backgroundImage: imageSrc, categories: cats, points: [] }
      this.push(newComposition)
      return
    }

    // If some points refer to a non-existing category, remove it and reload
    const catsIds = cats.map(c => c.id)
    const hasInvalidCategoryId = (p: Point): boolean => (p.categoryId !== undefined) && (!catsIds.includes(p.categoryId))
    if (pts.some(hasInvalidCategoryId)) {
      const newPts = pts.map(p => {
        if (hasInvalidCategoryId(p)) {
          delete p.categoryId
        }
        return p
      })
      const newComposition: ExportableComposition = { backgroundImage: imageSrc, categories: cats, points: newPts }
      this.push(newComposition)
      return
    }

    // Everything is OK
    const newComposition: ExportableComposition = { backgroundImage: imageSrc, categories: cats, points: pts }

    this.saveComposition()
    await this.fromExportableComposition(newComposition)
  }

  @Watch('$store.state.route.query')
  async onQueryChange (query: string, oldVal: string) {
    this.processQuery(query)
  }
}
</script>

<style lang="sass">
  .v-content
    height: 100vh
  #keep .v-app-bar .title
    color: inherit
    text-decoration: none
</style>
