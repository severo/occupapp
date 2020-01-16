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
          v-for="(imageSpec, i) in imageSpecs"
          :key="i"
          cols="auto"
        >
          <v-item
            v-slot:default="{ active, toggle }"
          >
            <v-img
              :src="imageSpec.thumbnailSrc || imageSpec.src"
              :srcset="imageSpec.srcset"
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
import { ImageSpec } from '@/types'
import { goToImageSpec } from '@/utils/urlQuery.ts'

import ImageUploaderButton from '@/components/ImageUploaderButton.vue'

import BackgroundImage from '@/store/current/backgroundImage.ts'
import GalleryImages from '@/store/galleryImages.ts'

const backgroundImage = getModule(BackgroundImage)
const galleryImages = getModule(GalleryImages)

@Component({
  components: {
    ImageUploaderButton
  }
})
export default class Gallery extends Vue {
  get imageSpecs (): ImageSpec[] {
    return galleryImages.asArray
  }
  get selected (): number {
    return this.imageSpecs.findIndex(spec => spec.src === backgroundImage.src)
  }
  set selected (idx: number) {
    // Update the URL with the selected image.
    goToImageSpec(this.imageSpecs[idx])
  }
  addFiles (files: File[]) {
    galleryImages.appendFromFiles(files)
    files = []
  }
}
</script>
