<template>
  <div
    class="d-flex align-center ma-0"
    ref="wrapper"
    :style="wrapperStyle"
  >
    <v-skeleton-loader
      class="mx-auto"
      width="300"
      type="card"
      v-show="isPlaceholderVisible"
    />
    <canvas
      ref="imagecanvas"
      :style="canvasStyle"
      v-show="isCanvasVisible"
    />
    <ImageCacheCanvas
      :width="width"
      :height="height"
      :device-pixel-ratio="devicePixelRatio"
      :image="image"
      :is-colored="isColored"
      @update:canvas="updateCache"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { getModule } from 'vuex-module-decorators'
import { Prop, Watch } from 'vue-property-decorator'
import { Delaunay } from 'd3-delaunay'
import * as d3 from 'd3'
import { Point } from '@/types'

import ImageCacheCanvas from '@/components/ImageCacheCanvas.vue'

import Settings from '@/store/settings.ts'
import BackgroundImage from '@/store/current/backgroundImage.ts'
import Categories from '@/store/current/categories.ts'
import Points from '@/store/current/points.ts'
import PointsMetrics from '@/store/current/pointsMetrics.ts'

const settings = getModule(Settings)
const backgroundImage = getModule(BackgroundImage)
const categories = getModule(Categories)
const points = getModule(Points)
const pointsMetrics = getModule(PointsMetrics)

@Component({
  components: {
    ImageCacheCanvas
  }
})
export default class Background extends Vue {
  // props
  @Prop({ default: 300 }) readonly width!: number
  @Prop({ default: 150 }) readonly height!: number
  @Prop({ default: 1 }) readonly devicePixelRatio!: number

  // local data
  imageCacheCanvas: HTMLCanvasElement | undefined = undefined
  imageCacheCanvasChangeTracker: number = 1
  debounceTimer: number = 0
  isCanvasRendering: boolean = false

  // annotate refs type
  $refs!: {
    imagecanvas: HTMLCanvasElement,
  }

  // computed
  get image (): HTMLImageElement {
    return backgroundImage.image
  }
  get canvas (): HTMLCanvasElement {
    return this.$refs.imagecanvas
  }
  get ctx (): CanvasRenderingContext2D | null {
    return this.canvas.getContext('2d')
  }
  get canvasWidth (): number {
    return this.width * this.devicePixelRatio
  }
  get canvasHeight (): number {
    return this.height * this.devicePixelRatio
  }
  get totalArea (): number {
    return this.width * this.height
  }
  get canvasStyle (): {width: string, height: string} {
    return {
      width: `${this.width}px`,
      height: `${this.height}px`
    }
  }
  get wrapperStyle (): {width: string, height: string} {
    return { ...this.canvasStyle }
  }
  get pointsArray (): Point[] {
    return points.asArray
  }
  // TODO check if there is a best practice for use of 'private' keyword, and if we follow it
  private get isPlaceholderVisible (): boolean {
    return !backgroundImage.isReady
  }
  private get isCanvasVisible (): boolean {
    return !this.isPlaceholderVisible
  }
  get x () {
    return d3
      .scaleLinear()
      .domain([0, 100])
      .range([0, this.width])
  }
  get y () {
    return d3
      .scaleLinear()
      .domain([0, 100])
      .range([0, this.height])
  }
  get voronoi () {
    return Delaunay.from(
      this.pointsArray,
      (d: Point): number => this.x(d.x),
      (d: Point): number => this.y(d.y)
    ).voronoi([0, 0, this.width, this.height])
  }
  get isColored (): boolean {
    return settings.showImageColors
  }

  // methods
  updateCache (canvas: HTMLCanvasElement) {
    this.imageCacheCanvas = canvas
    this.imageCacheCanvasChangeTracker += 1
  }

  drawCanvas (): void {
    if (this.ctx === null) { return }
    // Redraw & reposition content
    this.ctx.setTransform(this.devicePixelRatio, 0, 0, this.devicePixelRatio, 0, 0)
    this.ctx.clearRect(0, 0, this.width, this.height)
    // Note: if image "srcset" is set (responsive image), the most adequate image size is used here
    // TODO confirm above comment
    if (this.imageCacheCanvas !== undefined) {
      this.ctx.drawImage(this.imageCacheCanvas, 0, 0, this.width, this.height)
    }

    this.drawVoronoi(this.ctx)
  }

  drawVoronoi (context: CanvasRenderingContext2D): void {
    context.save()
    const v = this.voronoi
    let i = 0
    for (const point of this.pointsArray) {
      context.beginPath()
      v.renderCell(i++, context)
      context.globalAlpha = 0.5
      context.fillStyle = categories.getColor(point.categoryId)
      context.fill()

      context.globalAlpha = 1
      context.lineWidth = 1
      context.strokeStyle = '#fff'
      context.stroke()
    }
    context.restore()
  }

  updateAreas (): void {
    let i = 0
    for (const point of this.pointsArray) {
      const polygon: [number, number][] = this.voronoi.cellPolygon(i++).map(
        // this is only to adjust a TypeScript mismatch between d3-delaunay and
        // d3-polygon
        // See https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/d3-delaunay/index.d.ts#L159
        // and https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/d3-polygon/index.d.ts
        p => [p[0], p[1]]
      )
      const area = Math.abs(d3.polygonArea(polygon)) / this.totalArea
      pointsMetrics.setArea({ pointId: point.id, area })
    }
  }

  // watchers

  @Watch('imageCacheCanvasChangeTracker')
  @Watch('width')
  @Watch('height')
  @Watch('devicePixelRatio')
  @Watch('pointsArray', { deep: true })
  onSomethingChange () {
    // See https://stackoverflow.com/a/37588776/7351594
    this.isCanvasRendering = true
    clearTimeout(this.debounceTimer)
    this.debounceTimer = window.setTimeout(() => {
      // Note how we use an arrow function to get access to the "this" object
      // See https://stackoverflow.com/a/38737108/7351594

      // Always change the size before rendering (because size change cleans the canvas)
      this.canvas.width = this.canvasWidth
      this.canvas.height = this.canvasHeight
      this.drawCanvas()
      this.updateAreas()
      this.isCanvasRendering = false
    }, 10)
  }
}
</script>
