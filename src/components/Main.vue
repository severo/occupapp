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
import { goToCurrentComposition } from '@/utils/urlQuery.ts'
import { Point } from '@/types'

import MainPanel from '@/components/MainPanel.vue'

import Categories from '@/store/current/categories.ts'
import PointsSelection from '@/store/current/pointsSelection.ts'
import Points from '@/store/current/points.ts'
import Socket from '@/store/socket.ts'

const categories = getModule(Categories)
const pointsSelection = getModule(PointsSelection)
const points = getModule(Points)
const socket = getModule(Socket)

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
    // Send to the socket server
    socket.change(this.getSocketCallbackDeletePoints(pointsSelection.asArray))
    pointsSelection.clear()
    // Update the URL after deleting the points
    goToCurrentComposition()
  }
  addPoint () {
    // As the API doesn't return the created point, we have to look for it
    const before = new Set(points.asMap.keys())
    points.postRandom(categories.asArray[points.size % categories.size].id)
    const after = new Set(points.asMap.keys())
    const difference: string[] = [...after].filter(x => !before.has(x))
    if (difference.length === 1) {
      const lastPoint = points.asMap.get(difference[0])
      if (lastPoint !== undefined) {
        // Send to the socket server
        socket.change(this.getSocketCallbackAddPoint(lastPoint))
      }
    }
    // Update the URL after adding the point
    goToCurrentComposition()
  }

  // TODO: don't use any type
  getSocketCallbackDeletePoints (ids: string[]): any {
    // TODO: don't use any type
    return (doc: any) => {
      for (let i = 0; i < ids.length; i++) {
        delete doc.composition.points[ids[i]]
      }
    }
  }

  getSocketCallbackAddPoint (point: Point): any {
    // TODO: don't use any type
    return (doc: any) => {
      doc.composition.points[point.id] = {}
      doc.composition.points[point.id].id = point.id
      doc.composition.points[point.id].number = point.number
      doc.composition.points[point.id].x = point.x
      doc.composition.points[point.id].y = point.y
      doc.composition.points[point.id].categoryId = point.categoryId
    }
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
