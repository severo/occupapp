<template>
  <div>
    <v-list dense>
      <v-list-item-group
        v-model="pointsIdxSelectionArray"
        multiple
        color="indigo"
      >
        <v-list-item
          v-for="point of pointsArray"
          :key="point.id"
        >
          <v-list-item-content>
            <v-list-item-title v-text="`Point ${point.number}`" />
            <v-list-item-subtitle v-text="getAreaString(point.id)" />
            <svg
              width="100%"
              height="10px"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <rect
                x="0"
                y="0"
                :width="getArea(point.id)"
                height="10"
                :fill="getColor(point.categoryId)"
              />
            </svg>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </div>
</template>

<style scoped>
.v-subheader {
  text-transform: uppercase;
}
</style>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import { Point } from '@/types'

import {
  categoriesStore,
  pointsStore,
  pointsMetricsStore,
  pointsSelectionStore
} from '@/store'

@Component
export default class PointsList extends Vue {
  // computed
  get pointsArray (): Point[] {
    return pointsStore.asArray
  }
  get pointsIdxSelectionArray (): number[] {
    // v-list-item-group only allows to manage indexes of an array. We have to
    // transform the uuid to integers
    // https://vuetifyjs.com/en/components/list-item-groups
    const pointsSelectionSet = pointsSelectionStore.asSet
    const arr: number[] = []
    // we have to loop on this.pointsArray to get the same indexes as in the
    // v-list-item element in the template
    // TODO: improve this?
    this.pointsArray.forEach((p, idx) => {
      if (pointsSelectionSet.has(p.id)) {
        arr.push(idx)
      }
    })
    return arr
  }
  set pointsIdxSelectionArray (idxArray: number[]) {
    // transform the index array back to a uuid array
    pointsSelectionStore.fromArray(
      idxArray.map(idx => this.pointsArray[idx].id)
    )
  }
  // Methods
  getArea (id: string): number {
    const area = pointsMetricsStore.getArea(id)
    return area ? 100 * area.area : 0
  }
  getAreaString (id: string): string {
    const area = pointsMetricsStore.getArea(id)
    return area ? `Area: ${Math.round(100 * area.area)}%` : ``
  }
  getColor (id: string): string {
    return categoriesStore.getColor(id)
  }
}
</script>
