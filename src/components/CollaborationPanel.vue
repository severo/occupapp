<template>
  <v-container>
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

import { connect, disconnect } from '@/utils/socket.ts'

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

  toggleCollaboration () {
    if (settings.isCollaborationActive === true) {
      settings.disableCollaboration()
      // Disconnect the socket
      disconnect()
    } else {
      // TODO: add a loader icon + a message in case the connection fails (or is lost)
      // Establish connection
      connect()
      settings.enableCollaboration()
    }
  }
}
</script>
