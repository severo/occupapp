<template>
  <pre><code>{{ jsonString }}</code></pre>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { getModule } from 'vuex-module-decorators'

import Compositions from '@/store/compositions.ts'

const compositions = getModule(Compositions)

@Component
export default class StoreJSON extends Vue {
  get jsonString () {
    return JSON.stringify(compositions.asArray, null, 2)
  }
}

</script>
