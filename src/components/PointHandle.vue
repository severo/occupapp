<template>
  <g
    ref="g"
    class="point"
    :class="{ 'indigo--text': selected, selected: selected }"
    :transform="transform"
  >
    <circle
      class="background"
      cx="0"
      cy="0"
      :r="radiusBackground"
    />
    <circle
      class="overlay"
      cx="0"
      cy="0"
      :r="radiusBackground"
    />
    <circle
      class="select"
      cx="0"
      cy="0"
      :r="radiusSelect"
      :stroke-dasharray="strokeDashArray"
      :stroke-dashoffset="strokeDashOffset"
    />
    <text
      class="text"
    >
      {{ text }}
    </text>
  </g>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import * as d3 from 'd3'
import { mdiCheck } from '@mdi/js'

@Component
export default class PointHandle extends Vue {
  // props
  @Prop({ default: 0 }) readonly x!: number
  @Prop({ default: 0 }) readonly y!: number
  @Prop({ default: 300 }) readonly width!: number
  @Prop({ default: 150 }) readonly height!: number
  @Prop({ default: false }) readonly selected!: boolean
  @Prop({ default: false }) readonly selecting!: boolean
  @Prop({ default: '' }) readonly text!: string

  // local data
  radiusBackground = 17
  radiusSelect = 15
  selectionProgress = 0
  selectionInterval = 0
  selectionStartTimeout = 0

  // annotate refs type
  $refs!: {
    g: SVGGElement,
  }

  get g () {
    return d3.select<SVGGElement, unknown>(this.$refs.g)
  }
  get circumference (): number {
    return 2 * Math.PI * this.radiusSelect
  }
  get strokeDashArray (): number {
    return Math.round(this.circumference * 1000) / 1000
  }
  get strokeDashOffset (): string {
    return ((100 - this.selectionProgress) / 100) * this.circumference + 'px'
  }
  get xScale () {
    return d3
      .scaleLinear()
      .domain([0, 100])
      .range([0, this.width])
  }
  get yScale () {
    return d3
      .scaleLinear()
      .domain([0, 100])
      .range([0, this.height])
  }
  get xAtScale (): number {
    return this.xScale(this.x)
  }
  get yAtScale (): number {
    return this.yScale(this.y)
  }
  get transform (): string {
    return `translate(${this.xAtScale}, ${this.yAtScale})`
  }
  get drag () {
    return d3
      .drag<SVGGElement, unknown>()
      .on('start', this.dragStarted)
      .on('drag', this.dragged)
      .on('end', this.dragEnded)
  }

  // lifecycle hook
  mounted () {
    this.drag(this.g)
  }

  // methods
  dragStarted () {
    if (this.selecting) {
      this.toggleSelected()
    } else {
      this.g.classed('dragged', true)
      this.initSelecting()
    }
  }
  dragged () {
    if (!this.selecting) {
      this.cancelSelecting()
      this.$emit('updatemovingxy', { x: this.x + this.xScale.invert(d3.event.dx), y: this.y + this.yScale.invert(d3.event.dy) })
      this.initSelecting()
    }
  }
  dragEnded () {
    if (!this.selecting) {
      this.cancelSelecting()
      this.$emit('updatexy', { x: this.x + this.xScale.invert(d3.event.dx), y: this.y + this.yScale.invert(d3.event.dy) })
      this.g.classed('dragged', false)
    }
  }
  initSelecting () {
    this.cancelSelecting()
    this.selectionStartTimeout = window.setTimeout(() => {
      this.runSelecting()
    }, 500)
  }
  runSelecting () {
    this.selectionInterval = window.setInterval(() => {
      if (this.selectionProgress < 100) {
        this.selectionProgress += 2
      } else {
        this.commitSelected()
      }
    }, 10)
  }
  cancelSelecting () {
    clearInterval(this.selectionInterval)
    clearTimeout(this.selectionStartTimeout)
    this.selectionProgress = 0
  }
  commitSelected () {
    this.cancelSelecting()
    this.g.classed('dragged', false)
    this.$emit('select')
  }
  toggleSelected () {
    this.$emit('toggle')
  }
}
</script>

<style lang="sass">
.point
  cursor: pointer
  opacity: 0.7

  &:hover
    opacity: 0.9
    filter: url(#elevation2)
  &.dragged
    opacity: 0.9
    stroke-opacity: 0.5
    filter: url(#elevation8)
  &.selected
    opacity: 0.9
    circle.background
      stroke: currentColor
    circle.overlay
      stroke: none
      fill: currentColor
      opacity: 1
    text.text
      fill: white

  circle.background
    fill: white
    stroke: black
  circle.overlay
    opacity: 0
  circle.select
    fill: transparent
    stroke-width: 5
    stroke: black
  text.text
    dominant-baseline: central
    text-anchor: middle
    stroke: none
    fill: currentColor
    font-size: 15px
    font-weight: bold

</style>
