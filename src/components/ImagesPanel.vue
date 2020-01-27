<template>
  <v-container>
    <Gallery />
    <v-switch
      v-model="isColored"
      label="Show image colors"
    />
  </v-container>
</template>

<style scoped></style>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

import Gallery from '@/components/Gallery.vue'

import { settingsStore } from '@/store'

@Component({
  components: {
    Gallery
  }
})
export default class ImagesPanel extends Vue {
  get isColored (): boolean {
    return settingsStore.showImageColors
  }
  set isColored (value: boolean) {
    settingsStore.setShowImageColors(value)
  }
}
</script>
