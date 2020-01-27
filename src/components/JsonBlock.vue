<template>
  <pre><code>{{ jsonString }}</code></pre>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

@Component
export default class StoreJSON extends Vue {
  // props
  @Prop({ default: {} }) readonly json!: any

  get jsonString () {
    return JSON.stringify(this.json, null, 2)
  }
}
</script>
