<template>
  <v-container>
    <v-list subheader>
      <v-subheader>Me</v-subheader>

      <v-list-item
        v-for="item in [guest]"
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
  get otherGuests (): Guest[] {
    return socketStore.guests.filter(g => g.sId !== this.guest.sId)
  }
  get guest (): Guest {
    return socketStore.guest
  }
}
</script>
