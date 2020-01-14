import { ImageSpec } from '@/utils/types.ts'

// TODO set a small height and width initially to avoid loading the heaviest image, if srcset exists (responsive image)? is this how onload works?
// TODO should we also generate a thumbnail?
export async function fetchImage ({
  src,
  srcset
}: ImageSpec): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img: HTMLImageElement = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
    if (srcset) {
      img.srcset = srcset
    }
  })
}

export async function validateImageSpec ({ src, srcset }: ImageSpec): Promise<boolean> {
  return fetchImage({ src, srcset }).then(() => true).catch(() => false)
}

/*
 * Create a Base64 Image URL, with rotation applied to compensate for EXIF orientation, if needed.
 *
 * Optionally resize to a smaller maximum width - to improve performance for larger image thumbnails.
 *
 * Note: the base64 will use JPEG format, with 0.92 image quality value
 * See https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL
 *
 * Source: https://gist.github.com/mindplay-dk/72f47c1a570e870a375bd3dbcb9328fb
 */
export async function getImageUrl (
  file: File,
  maxWidth: number | undefined = 999999
) {
  return readOrientation(file).then(orientation => {
    return applyRotation(file, orientation || 1, maxWidth)
  }
  )
}

/**
 * @returns EXIF orientation value (or undefined)
 *
 * Source: https://gist.github.com/mindplay-dk/72f47c1a570e870a375bd3dbcb9328fb
 */
const readOrientation = (file: File) =>
  new Promise<number | undefined>(resolve => {
    const reader = new FileReader()

    reader.onload = () =>
      resolve(
        (() => {
          const view = new DataView(reader.result as ArrayBuffer)

          if (view.getUint16(0, false) !== 0xffd8) {
            return
          }

          const length = view.byteLength

          let offset = 2

          while (offset < length) {
            const marker = view.getUint16(offset, false)

            offset += 2

            if (marker === 0xffe1) {
              offset += 2

              if (view.getUint32(offset, false) !== 0x45786966) {
                return
              }

              offset += 6

              const little = view.getUint16(offset, false) === 0x4949

              offset += view.getUint32(offset + 4, little)

              const tags = view.getUint16(offset, little)

              offset += 2

              for (var i = 0; i < tags; i++) {
                if (view.getUint16(offset + i * 12, little) === 0x0112) {
                  return view.getUint16(offset + i * 12 + 8, little)
                }
              }
            } else if ((marker & 0xff00) !== 0xff00) {
              break
            } else {
              offset += view.getUint16(offset, false)
            }
          }
        })()
      )

    reader.readAsArrayBuffer(file.slice(0, 64 * 1024))
  })

/**
 * @returns Base64 Image URL (with rotation applied to compensate for orientation, if any)
 *
 * Source: https://gist.github.com/mindplay-dk/72f47c1a570e870a375bd3dbcb9328fb
 */
const applyRotation = (file: File, orientation: number, maxWidth: number) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const url = reader.result as string

      const image = new Image()

      image.onload = () => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')

        if (context === null) {
          reject(
            new RangeError(
              `Canvas 2d context is null. Cannot apply rotation to the image.`
            )
          )
        } else {
          let { width, height } = image

          const [outputWidth, outputHeight] =
            orientation >= 5 && orientation <= 8
              ? [height, width]
              : [width, height]

          const scale = outputWidth > maxWidth ? maxWidth / outputWidth : 1

          width = width * scale
          height = height * scale

          // set proper canvas dimensions before transform & export
          canvas.width = outputWidth * scale
          canvas.height = outputHeight * scale

          // transform context before drawing image
          switch (orientation) {
            case 2:
              context.transform(-1, 0, 0, 1, width, 0)
              break
            case 3:
              context.transform(-1, 0, 0, -1, width, height)
              break
            case 4:
              context.transform(1, 0, 0, -1, 0, height)
              break
            case 5:
              context.transform(0, 1, 1, 0, 0, 0)
              break
            case 6:
              context.transform(0, 1, -1, 0, height, 0)
              break
            case 7:
              context.transform(0, -1, -1, 0, height, width)
              break
            case 8:
              context.transform(0, -1, 1, 0, 0, width)
              break
            default:
              break
          }

          // draw image
          context.drawImage(image, 0, 0, width, height)

          // export base64
          resolve(canvas.toDataURL('image/jpeg'))
        }
      }

      image.src = url
    }

    reader.readAsDataURL(file)
  })
