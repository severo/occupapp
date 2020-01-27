<template>
  <!-- adapted from https://vuetifyjs.com/en/styles/elevation -->
  <filter
    id="elevation2"
    filter-units="userSpaceOnUse"
    height="100"
    width="100"
    x="-50"
    y="-50"
  >
    <feDropShadow
      dx="0"
      dy="3"
      std-deviation="1"
      flood-color="black"
      flood-opacity="0.2"
    />
    <feDropShadow
      dx="0"
      dy="2"
      std-deviation="2"
      flood-color="black"
      flood-opacity="0.14"
    />
    <feDropShadow
      dx="0"
      dy="1"
      std-deviation="5"
      flood-color="black"
      flood-opacity="0.12"
    />
  </filter>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class FilterShadow2 extends Vue {}
</script>
