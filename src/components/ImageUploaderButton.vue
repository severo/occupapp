<template>
  <v-dialog
    v-model="dialog"
    max-width="500px"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        text
        v-on="on"
      >
        <v-icon>mdi-paperclip</v-icon> Add images
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">Upload images</span>
      </v-card-title>
      <v-card-text>
        <v-file-input
          v-model="files"
          multiple
          accept="image/*"
          placeholder="Select one image (or various)"
          prepend-icon="mdi-camera"
          label="Images"
        />

        <v-row>
          <v-col
            v-for="(src, n) in srcs"
            :key="n"
            class="d-flex child-flex"
            cols="4"
          >
            <v-card
              flat
              tile
              class="d-flex"
            >
              <v-img
                :src="src"
                :lazy-src="src"
                aspect-ratio="1"
                class="grey lighten-2"
              >
                <template v-slot:placeholder>
                  <v-row
                    class="fill-height ma-0"
                    align="center"
                    justify="center"
                  >
                    <v-progress-circular
                      indeterminate
                      color="grey lighten-5"
                    />
                  </v-row>
                </template>
              </v-img>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="blue darken-1"
          text
          @click="dialog = false"
        >
          Close
        </v-btn>
        <v-btn
          color="primary"
          :disabled="okButtonDisabled"
          @click="okButtonClicked"
        >
          {{ okButtonText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class ImageUploaderButton extends Vue {
  dialog: boolean = false
  files: File[] = []

  get srcs (): string[] {
    return this.files.map(f => window.URL.createObjectURL(f))
  }
  get okButtonDisabled (): boolean {
    return this.files.length === 0
  }
  get okButtonText (): string {
    if (this.files.length === 0) {
      return 'Add images'
    } else if (this.files.length === 1) {
      return 'Add 1 image'
    } else {
      return `Add ${this.files.length} images`
    }
  }

  okButtonClicked () {
    this.$emit('update:files', this.files)
    this.files = []
    this.dialog = false
  }
}
</script>
