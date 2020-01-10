<template>
  <v-container>
    <v-item-group
      v-model="selected"
      mandatory
    >
      <v-row
        dense
        class="images-row"
      >
        <v-col
          v-for="(imageSrc,i) in imageSrcsArray"
          :key="i"
          cols="auto"
        >
          <v-item
            v-slot:default="{ active, toggle }"
          >
            <v-img
              :src="imageSrc.thumbnailSrc || imageSrc.src"
              :srcset="imageSrc.srcset"
              class="grey lighten-2 text-right pa-2"
              width="64px"
              height="64px"
              aspect-ratio="1"
              @click="toggle"
            >
              <v-overlay
                absolute
              >
                <v-btn
                  icon
                  dark
                  class="select-image"
                >
                  <v-icon
                    large
                    :class="{active}"
                  >
                    mdi-check
                  </v-icon>
                </v-btn>
              </v-overlay>
            </v-img>
          </v-item>
        </v-col>
      </v-row>
    </v-item-group>

    <!-- See for details on this element: https://stackoverflow.com/a/42654487/7351594 -->
    <v-btn
      text
      tag="label"
    >
      <v-icon>mdi-paperclip</v-icon> Add images
      <input
        type="file"
        multiple
        accept="image/*"
        hidden
        @change="addFiles($event.target.files)"
      >
    </v-btn>
  </v-container>
</template>

<style scoped>
.v-subheader {
  text-transform: uppercase;
}
.v-overlay {
  opacity: 0
}
.v-item--active .v-overlay,
.v-overlay:hover,
.v-overlay:focus,
.v-overlay:active {
  opacity: 1;
}
.images-row {
  max-height: 250px;
  overflow-y: auto;
}
</style>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { getModule } from 'vuex-module-decorators'
import { ExportableComposition, ImageSrc } from '@/utils/types.ts'

import ImageUploaderButton from '@/components/ImageUploaderButton.vue'

import BackgroundImage from '@/store/current/backgroundImage.ts'
import ExportableCompositions from '@/store/exportableCompositions.ts'
import GalleryImages from '@/store/galleryImages.ts'

const backgroundImage = getModule(BackgroundImage)
const exportableCompositions = getModule(ExportableCompositions)
const galleryImages = getModule(GalleryImages)

@Component({
  components: {
    ImageUploaderButton
  }
})
export default class Gallery extends Vue {
  get imageSrcs (): Map<string, ImageSrc> {
    return galleryImages.asMap
  }
  get imageSrcsArray (): ImageSrc[] {
    return [...this.imageSrcs.values()]
  }
  get srcsArray (): string[] {
    return [...this.imageSrcs.keys()]
  }
  get selected (): number {
    return this.srcsArray.indexOf(backgroundImage.src)
  }
  set selected (idx: number) {
    const src = this.srcsArray[idx]
    const c: ExportableComposition | undefined = exportableCompositions.get(src)
    if (c !== undefined) {
      this.$router.push({ query: {
        ...this.$store.state.route.query,
        imageSrc: c.backgroundImage.localId || c.backgroundImage.src,
        categories: JSON.stringify(c.categories),
        points: JSON.stringify(c.points)
      } })
    } else {
      const im: ImageSrc | undefined = galleryImages.get(src)
      if (im !== undefined) {
        this.$router.push({ query: {
          // ...this.$store.state.route.query, // TODO: fix this <-- maybe there are other query parameters that we would want to keep
          imageSrc: im.localId || im.src
        } })
      }
    }
    // this.$emit('selected')
  }
  addFiles (files: File[]) {
    galleryImages.appendFilesArray(files)
    files = []
  }
}
</script>
