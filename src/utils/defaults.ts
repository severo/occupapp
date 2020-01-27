import * as d3 from 'd3'
import { ImageSpec } from '@/types'
import { getPlaceholderSrc } from './img'

// Images
function forgeUrl (name: string, width: number): string {
  return `https://github.com/severo/pictures/raw/master/images,w_${width}/${name}.jpg`
}

const names: string[] = [
  'petanque',
  'boats',
  'honeycomb',
  'spider',
  'wolves',
  'bazzania',
  'basketball',
  'beach',
  'cuzco'
]
const widths: number[] = [320, 640, 768, 1024, 1366, 1600, 1920]
const sortedWidth: number[] = [...widths].sort(
  (a: number, b: number): number => a - b
)
const minWidth: number = sortedWidth[0]
const maxWidth: number = sortedWidth[sortedWidth.length - 1]

const defaultImageSpecs: ImageSpec[] = names.map(name => {
  return {
    src: forgeUrl(name, maxWidth),
    srcset: widths.map(w => `${forgeUrl(name, w)} ${w}w`).join(','),
    exportableSrc: forgeUrl(name, maxWidth),
    thumbnailSrc: forgeUrl(name, minWidth)
  }
})
const placeholderImageSpec = {
  src: getPlaceholderSrc(),
  srcset: '',
  thumbnailSrc: '',
  exportableSrc: getPlaceholderSrc(50, 25)
}

// Categories
const defaultColors: string[] = [
  d3.rgb(255, 195, 8),
  d3.rgb(172, 159, 253),
  d3.rgb(181, 246, 66),
  d3.rgb(239, 106, 222)
].map(c => c.hex())

export { placeholderImageSpec, defaultImageSpecs, defaultColors }
