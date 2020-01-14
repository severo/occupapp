<template>
  <svg
    :viewBox="viewbox"
    :style="svgStyle"
  >
    <defs>
      <FilterShadow2 />
      <FilterShadow8 />
    </defs>
    <g class="points">
      <PointHandle
        v-for="(point, idx) of pointsArray"
        :key="idx"
        :x="point.x"
        :y="point.y"
        @updatemovingxy="updateXY(point.id, $event.x, $event.y) /* Note: the URL is not updated during the move */"
        @updatexy="updateXYAndPersist(point.id, $event.x, $event.y)"
        :selected="isSelected(point.id)"
        @select="select(point.id)"
        @toggle="toggle(point.id)"
        :text="`${point.number}`"
        :width="width"
        :height="height"
        :selecting="selecting"
      />
    </g>
  </svg>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import { Point } from '@/utils/types.ts'
import { goToCurrentComposition } from '@/utils/urlQuery.ts'

import FilterShadow2 from '@/components/FilterShadow2.vue'
import FilterShadow8 from '@/components/FilterShadow8.vue'
import PointHandle from '@/components/PointHandle.vue'

import Points from '@/store/current/points.ts'
import PointsSelection from '@/store/current/pointsSelection.ts'

const points = getModule(Points)
const pointsSelection = getModule(PointsSelection)

@Component({
  components: {
    FilterShadow2,
    FilterShadow8,
    PointHandle
  }
})
export default class Handles extends Vue {
  // props
  @Prop({ default: 300 }) readonly width!: number
  @Prop({ default: 150 }) readonly height!: number

  // local data
  radius = 15

  // computed
  get viewbox (): string {
    return `0 0 ${this.width} ${this.height}`
  }
  get svgStyle (): { width: string; height: string } {
    return {
      width: `${this.width}px`,
      height: `${this.height}px`
    }
  }

  get pointsArray (): Point[] {
    return points.asArray
  }
  get selecting (): boolean {
    return pointsSelection.size > 0
  }

  // methods
  updateXY (pointId: string, x: number, y: number): void {
    // Only update the inner state (don't update the URL)
    points.setXY({ id: pointId, x, y })
  }
  updateXYAndPersist (pointId: string, x: number, y: number): void {
    // Update the URL after the point has been updated
    points.setXY({ id: pointId, x, y })
    goToCurrentComposition()
  }
  select (pointId: string):void {
    pointsSelection.add(pointId)
  }
  toggle (pointId: string):void {
    pointsSelection.toggle(pointId)
  }
  isSelected (pointId: string): boolean {
    return pointsSelection.has(pointId)
  }
}
</script>
