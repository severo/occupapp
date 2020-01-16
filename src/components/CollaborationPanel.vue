<template>
  <div class="px-2">
    <v-switch
      v-model="isCollaborationActive"
      label="Connect to collaboration room"
    />
    <div v-if="isCollaborationActive && isConnected">
      <h3 class="title mt-4 mb-2">
        Welcome to the collaboration room
      </h3>
      <SocketGuests />
    </div>
    <div v-else-if="isCollaborationActive && !isConnected">
      <h3 class="title mt-4 mb-2">
        Connecting to the room...
      </h3>
    </div>
  </div>
</template>

<style scoped></style>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { getModule } from 'vuex-module-decorators'

import SocketGuests from '@/components/SocketGuests.vue'

import Socket from '@/store/socket.ts'
import Settings from '@/store/settings.ts'

const socketStore = getModule(Socket)
const settings = getModule(Settings)

@Component({
  components: {
    SocketGuests
  }
})
export default class CollaborationPanel extends Vue {
  get isConnected (): boolean {
    return socketStore.socket.connected
  }
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
      socketStore.disconnect()
    } else {
      // TODO: add a loader icon + a message in case the connection fails (or is lost)
      // Establish connection
      socketStore.connect()
      settings.enableCollaboration()
    }
  }
}
</script>
