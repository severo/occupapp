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
      Spec
    </h3>
    <SpecJSON />

    <h2 class="title mt-4 mb-2">
      Full internal state
    </h2>

    <h3 class="subtitle-1 mt-4 mb-2">
      State
    </h3>
    <StoreJSON />
  </v-container>
</template>

<style scoped>

</style>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

import CategoriesTable from '@/components/CategoriesTable.vue'
import PointsTable from '@/components/PointsTable.vue'
import StoreJSON from '@/components/StoreJSON.vue'
import SpecJSON from '@/components/SpecJSON.vue'

@Component({
  components: {
    CategoriesTable,
    PointsTable,
    StoreJSON,
    SpecJSON
  }
})
export default class TablesPanel extends Vue {
}

</script>
