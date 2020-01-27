<template>
  <div class="px-2">
    <v-switch
      v-model="isCollaborationActive"
      label="Connect to the collaboration room"
    />
    <div v-if="isCollaborationActive && isConnected">
      <h3 class="title mt-4 mb-2">
        Welcome to the collaboration room
      </h3>
      <SocketGuests />
      <p class="overline">
        Also join the
        <a
          target="_blank"
          href="https://meet.jit.si/occupappbeta"
        >Jitsi room<v-icon
          style="color: currentColor; fontSize: 0.7rem"
        >mdi-open-in-new</v-icon></a>
        for more interaction.
      </p>
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

import SocketGuests from '@/components/SocketGuests.vue'

import { socketStore, settingsStore } from '@/store'

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
    return settingsStore.isCollaborationActive
  }
  set isCollaborationActive (value: boolean) {
    this.toggleCollaboration()
  }

  toggleCollaboration () {
    if (settingsStore.isCollaborationActive === true) {
      settingsStore.disableCollaboration()
      // Disconnect the socket
      socketStore.disconnect()
    } else {
      // TODO: add a loader icon + a message in case the connection fails (or is lost)
      // Establish connection
      socketStore.connect()
      settingsStore.enableCollaboration()
    }
  }
}
</script>
