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
        @updatexy="updateXY(point.id, $event.x, $event.y)"
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
import { Point } from '@/types'

import FilterShadow2 from '@/components/FilterShadow2.vue'
import FilterShadow8 from '@/components/FilterShadow8.vue'
import PointHandle from '@/components/PointHandle.vue'

import { pointsStore, pointsSelectionStore } from '@/store'

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
    return pointsStore.asArray
  }
  get selecting (): boolean {
    return pointsSelectionStore.size > 0
  }

  // methods
  updateXY (pointId: string, x: number, y: number): void {
    pointsStore.setXY({ id: pointId, x, y })
  }
  select (pointId: string): void {
    pointsSelectionStore.add(pointId)
  }
  toggle (pointId: string): void {
    pointsSelectionStore.toggle(pointId)
  }
  isSelected (pointId: string): boolean {
    return pointsSelectionStore.has(pointId)
  }
}
</script>
