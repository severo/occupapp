<template>
  <v-container
    fluid
    fill-height
    pa-0
    ref="container"
  >
    <v-row
      no-gutters
      class="height-100 position-relative"
      ref="firstcol"
    >
      <v-row
        no-gutters
        align="center"
        justify="center"
        class="height-100"
      >
        <MainPanel
          :width-getter="widthGetter"
          :height-getter="heightGetter"
        />
      </v-row>
      <v-banner
        class="floating"
        single-line
        elevation="8"
        transition="slide-y-transition"
        v-show="showBanner"
      >
        {{ selectedPointsText }}
        <template v-slot:actions>
          <v-btn
            text
            color="secondary"
            @click="cancelSelection"
          >
            Dismiss
          </v-btn>
          <v-btn
            text
            color="error"
            @click="deleteSelection"
          >
            Delete
          </v-btn>
        </template>
      </v-banner>

      <v-btn
        class="button"
        key="1"
        color="amber"
        fab
        large
        dark
        bottom
        left
        @click="addPoint"
      >
        <v-icon color="black">
          {{ buttonIcon }}
        </v-icon>
      </v-btn>
    </v-row>
  </v-container>
  <!-- </div> -->
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { getModule } from 'vuex-module-decorators'
import { mdiPlus } from '@mdi/js'
import { persistState } from '@/utils/router.ts'

import MainPanel from '@/components/MainPanel.vue'

import BackgroundImage from '@/store/current/backgroundImage.ts'
import Categories from '@/store/current/categories.ts'
import PointsSelection from '@/store/current/pointsSelection.ts'
import Points from '@/store/current/points.ts'

const backgroundImage = getModule(BackgroundImage)
const categories = getModule(Categories)
const pointsSelection = getModule(PointsSelection)
const points = getModule(Points)

@Component({
  components: {
    MainPanel
  }
})
export default class Main extends Vue {
  // annotate refs type
  $refs!: {
    container: HTMLElement,
    firstcol: HTMLElement
  }

  get buttonIcon (): string {
    return mdiPlus
  }
  get widthGetter (): () => number {
    return () => this.$refs.firstcol ? this.$refs.firstcol.clientWidth : 300
  }
  get heightGetter (): () => number {
    return () => this.$refs.container ? this.$refs.container.clientHeight : 150
  }

  get selectedPointsText (): string {
    return `${pointsSelection.size} ${pointsSelection.size === 1 ? 'point' : 'points'}`
  }
  get showBanner (): boolean {
    return pointsSelection.size > 0
  }

  // methods
  cancelSelection () {
    pointsSelection.clear()
  }
  deleteSelection () {
    points.deleteSet(pointsSelection.asSet)
    pointsSelection.clear()
    persistState()
  }
  async addPoint () {
    points.postRandom(await categories.nextId())
    persistState()
  }
}
</script>

<style lang="sass">
.position-relative
  position: relative
  .floating
    position: absolute
    top: 20px
    left: 20px
    max-width: 90vw
    z-index: 4
  .button
    position: absolute
    bottom: 30px
    right: 30px
    z-index: 3
.height-100
  height: 100%
</style>
