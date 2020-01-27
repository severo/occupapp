<template>
  <v-container>
    <v-list subheader>
      <v-list-item>
        <v-list-item-icon>
          <v-icon :color="guest.color">
            mdi-circle
          </v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-text-field
            v-model="guestName"
            label="Enter your name"
          />
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-list
      subheader
      v-if="otherGuests.length > 0"
    >
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
    <v-list
      subheader
      v-else
    >
      <v-subheader>You're the only guest in the room</v-subheader>
    </v-list>
  </v-container>
</template>

<style scoped />

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Guest } from '@/types'

import { socketStore } from '@/store'

@Component
export default class SocketGuests extends Vue {
  debounceTimer: number = 0

  get otherGuests (): Guest[] {
    return socketStore.otherGuests
  }
  get guest (): Guest {
    return socketStore.guest
  }
  get guestName (): string {
    return this.guest.name || 'No name'
  }
  set guestName (name: string) {
    clearTimeout(this.debounceTimer)
    this.debounceTimer = window.setTimeout(() => {
      // Note how we use an arrow function to get access to the "this" object
      // See https://stackoverflow.com/a/38737108/7351594
      socketStore.updateGuestName(name)
    }, 1000) // 1 second to be sure the socket update loop does not interfere
    // when the user types (and there is no urgency in propagating the name
    // update)
  }
}
</script>
