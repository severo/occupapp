<template>
  <canvas
    ref="canvas"
    v-show="false"
  />
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

@Component
export default class ImageCacheCanvas extends Vue {
  // props
  @Prop({ default: 300 }) readonly width!: number
  @Prop({ default: 150 }) readonly height!: number
  @Prop({ default: 1 }) readonly devicePixelRatio!: number
  @Prop({ default: new Image() }) readonly image!: HTMLImageElement
  @Prop({ default: true }) readonly isColored!: boolean

  // local data
  debounceTimer: number = 0

  // annotate refs type
  $refs!: {
    canvas: HTMLCanvasElement
  }

  // computed
  get canvas (): HTMLCanvasElement {
    return this.$refs.canvas
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
  // lifecycle hook
  mounted () {
    this.drawCanvas()
  }

  // methods
  drawCanvas (): void {
    if (this.ctx === null) {
      return
    }
    // Redraw & reposition content
    this.ctx.setTransform(
      this.devicePixelRatio,
      0,
      0,
      this.devicePixelRatio,
      0,
      0
    )
    this.ctx.clearRect(0, 0, this.width, this.height)
    if (this.image.width === 0 || this.image.height === 0) {
      // Show a white rectangle in case the image is empty
      this.ctx.fillStyle = 'white'
      this.ctx.fillRect(0, 0, this.width, this.height)
    } else {
      // Note: if image "srcset" is set (responsive image), the most adequate image size is used here
      // TODO confirm above comment
      if (this.isColored) {
        this.ctx.drawImage(this.image, 0, 0, this.width, this.height)
      } else {
        this.ctx.filter = 'grayscale(100%)'
        this.ctx.drawImage(this.image, 0, 0, this.width, this.height)
        this.ctx.filter = 'grayscale(0%)'
      }
    }
  }

  @Watch('isColored')
  @Watch('image')
  @Watch('width')
  @Watch('height')
  @Watch('devicePixelRatio')
  onSomethingChange (
    val: boolean | number | HTMLImageElement,
    oldVal: boolean | number | HTMLImageElement
  ) {
    // See https://stackoverflow.com/a/37588776/7351594
    clearTimeout(this.debounceTimer)
    this.debounceTimer = window.setTimeout(() => {
      // Note how we use an arrow function to get access to the "this" object
      // See https://stackoverflow.com/a/38737108/7351594

      // Always change the size before rendering (because size change cleans the canvas)
      this.canvas.width = this.canvasWidth
      this.canvas.height = this.canvasHeight
      this.drawCanvas()
      this.$emit('update:canvas', this.canvas)
    }, 10)
  }
}
</script>
