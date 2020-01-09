<template>
  <router-view />
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class App extends Vue {
}
</script>

<style lang="sass">
  @import '../node_modules/typeface-roboto/index.css'
</style>
