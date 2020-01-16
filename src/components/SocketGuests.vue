<template>
  <v-container>
    <v-list subheader>
      <v-subheader>Me</v-subheader>

      <v-list-item>
        <v-list-item-icon>
          <v-icon :color="guest.color">
            mdi-circle
          </v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-text-field v-model="guestName" />
          <!-- <v-list-item-title v-text="guest.name" /> -->
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-divider />

    <v-list subheader>
      <v-subheader>Other guests</v-subheader>

      <v-list-item
        v-for="item in otherGuests"
        :key="item.title"
      >
        <v-list-item-icon>
          <v-icon :color="item.color">
            mdi-circle
          </v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title v-text="item.name" />
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<style scoped />

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { getModule } from 'vuex-module-decorators'

import { Guest } from '@/types'

import Socket from '@/store/socket.ts'

const socketStore = getModule(Socket)

@Component
export default class SocketGuests extends Vue {
  debounceTimer: number = 0

  get otherGuests (): Guest[] {
    return socketStore.guests.filter(g => g.sId !== this.guest.sId)
  }
  get guest (): Guest {
    return socketStore.guest
  }
  get guestName (): string {
    return this.guest.name
  }
  set guestName (name: string) {
    clearTimeout(this.debounceTimer)
    this.debounceTimer = window.setTimeout(() => {
      // Note how we use an arrow function to get access to the "this" object
      // See https://stackoverflow.com/a/38737108/7351594
      socketStore.updateGuest({ ...this.guest, name })
    }, 1000) // 1 second to be sure the socket update loop does not interfere
    // when the user types (and there is no urgency in propagating the name
    // update)
  }
}
</script>
