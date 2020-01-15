<template>
  <pre><code>{{ jsonString }}</code></pre>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { getModule } from 'vuex-module-decorators'

import { compositionToUrlQuerySpec } from '@/utils/composition.ts'
import Compositions from '@/store/compositions.ts'

const compositions = getModule(Compositions)

@Component
export default class SpecJSON extends Vue {
  get jsonString () {
    return JSON.stringify(compositionToUrlQuerySpec(compositions.current), null, 2)
  }
}

</script>
