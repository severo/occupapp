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
          v-for="c in compos"
          :key="c.id"
          cols="auto"
        >
          <v-item
            v-slot:default="{ active, toggle }"
          >
            <v-img
              :src="c.backgroundImage.thumbnailSrc || c.backgroundImage.src"
              :srcset="c.backgroundImage.srcset"
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
import { Composition } from '@/types'
import { getImageUrl } from '@/utils/img.ts'

import ImageUploaderButton from '@/components/ImageUploaderButton.vue'

import Compositions from '@/store/compositions.ts'

const compositions = getModule(Compositions)

@Component({
  components: {
    ImageUploaderButton
  }
})
export default class Gallery extends Vue {
  get compos (): Composition[] {
    return compositions.asArray
  }
  get selected (): number {
    // TODO: see if v-item-group could work with a map instead of an array
    return this.compos.findIndex(c => c.id === compositions.current.id)
  }
  set selected (idx: number) {
    // Update the URL with the selected composition
    compositions.updateCurrentComposition(this.compos[idx])
  }
  async addFiles (files: File[]) {
    // Actions
    // Important: actions only receive 1 argument (payload). If you want to
    // receive various arguments -> fields of an Object
    for (const f of files) {
      const dataUrl: string = await getImageUrl(f)
      if (dataUrl !== '') {
        compositions.appendFromDataUrl(dataUrl)
      }
    }
    files = []
  }
}
</script>
