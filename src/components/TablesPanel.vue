<template>
  <v-container>
    <h2 class="title mt-4 mb-2">
      Current composition
    </h2>

    <h3 class="subtitle-1 mt-4 mb-2">
      Points
    </h3>
    <PointsTable />

    <h3 class="subtitle-1 mt-4 mb-2">
      Categories
    </h3>
    <CategoriesTable />

    <h3 class="subtitle-1 mt-4 mb-2">
      Specification
    </h3>
    <JsonBlock :json="currentCompositionSpec" />

    <h2 class="title mt-4 mb-2">
      Full internal state
    </h2>

    <h3 class="subtitle-1 mt-4 mb-2">
      Current composition
    </h3>
    <JsonBlock :json="currentComposition" />

    <h3 class="subtitle-1 mt-4 mb-2">
      All compositions
    </h3>
    <JsonBlock :json="allCompositions" />
  </v-container>
</template>

<style scoped></style>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { compositionToUrlQuerySpec } from '@/utils/router.ts'

import CategoriesTable from '@/components/CategoriesTable.vue'
import PointsTable from '@/components/PointsTable.vue'
import JsonBlock from '@/components/JsonBlock.vue'

import { compositionsStore } from '@/store'

@Component({
  components: {
    CategoriesTable,
    PointsTable,
    JsonBlock
  }
})
export default class TablesPanel extends Vue {
  get currentCompositionSpec () {
    return compositionToUrlQuerySpec(compositionsStore.current)
  }
  get currentComposition () {
    return compositionsStore.current
  }
  get allCompositions () {
    return compositionsStore.asArray
  }
}
</script>
