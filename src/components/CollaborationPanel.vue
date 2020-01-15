<template>
  <v-container>
    <!-- <Gallery /> -->
    <v-switch
      v-model="isCollaborationActive"
      label="Connect to collaboration room (not implemented yet)"
    />
  </v-container>
</template>

<style scoped></style>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { getModule } from 'vuex-module-decorators'

import Settings from '@/store/settings.ts'

const settings = getModule(Settings)

@Component
export default class CollaborationPanel extends Vue {
  get isCollaborationActive (): boolean {
    return settings.isCollaborationActive
  }
  set isCollaborationActive (value: boolean) {
    this.toggleCollaboration()
  }

  async toggleCollaboration () {
    if (settings.isCollaborationActive === true) {
      // Disconnect
      await this.disconnect()
      settings.activateCollaboration(false)
    } else {
      await this.connect()
      settings.activateCollaboration(true)
    }
  }

  async connect () {
    // Establish connection
  }
  async disconnect () {
    // Establish connection
  }
}
</script>
