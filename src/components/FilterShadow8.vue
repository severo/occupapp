<template>
  <!-- adapted from https://vuetifyjs.com/en/styles/elevation -->
  <filter
    id="elevation8"
    filter-units="userSpaceOnUse"
    height="200"
    width="200"
    x="-100"
    y="-100"
  >
    <feDropShadow
      dx="0"
      dy="5"
      std-deviation="5"
      flood-color="black"
      flood-opacity="0.2"
    />
    <feDropShadow
      dx="0"
      dy="8"
      std-deviation="10"
      flood-color="black"
      flood-opacity="0.14"
    />
    <feDropShadow
      dx="0"
      dy="3"
      std-deviation="14"
      flood-color="black"
      flood-opacity="0.12"
    />
  </filter>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class FilterShadow8 extends Vue {}
</script>
