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
import { mdiPlus } from '@mdi/js'
import { Point } from '@/types'

import MainPanel from '@/components/MainPanel.vue'

import { categoriesStore, pointsStore, pointsSelectionStore } from '@/store'

@Component({
  components: {
    MainPanel
  }
})
export default class Main extends Vue {
  // annotate refs type
  $refs!: {
    container: HTMLElement
    firstcol: HTMLElement
  }

  get buttonIcon (): string {
    return mdiPlus
  }
  get widthGetter (): () => number {
    return () => (this.$refs.firstcol ? this.$refs.firstcol.clientWidth : 300)
  }
  get heightGetter (): () => number {
    return () =>
      this.$refs.container ? this.$refs.container.clientHeight : 150
  }

  get selectedPointsText (): string {
    return `${pointsSelectionStore.size} ${
      pointsSelectionStore.size === 1 ? 'point' : 'points'
    }`
  }
  get showBanner (): boolean {
    return pointsSelectionStore.size > 0
  }

  // methods
  cancelSelection () {
    pointsSelectionStore.clear()
  }
  deleteSelection () {
    pointsStore.deleteSet(pointsSelectionStore.asSet)
    pointsSelectionStore.clear()
  }
  addPoint () {
    pointsStore.postRandom(
      categoriesStore.asArray[pointsStore.size % categoriesStore.size].id
    )
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
