<template>
  <div>
    <HotTable :settings="hotSettings" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import Handsontable from 'handsontable'

import { HotTable } from '@handsontable/vue'

import { Category } from '@/types'

import { categoriesStore } from '@/store'

@Component({
  components: {
    HotTable
  }
})
export default class CategoriesTable extends Vue {
  get colFields () {
    return ['color']
  }
  get categoriesObject () {
    return categoriesStore.asArray.map(c => {
      return { color: c.color }
    })
  }
  get hotSettings () {
    return {
      data: this.categoriesObject,
      colHeaders: this.colFields,
      columns: [{ data: 'color', readOnly: true }],
      rowHeaders: true,
      height: 'auto',
      licenseKey: 'non-commercial-and-evaluation'
    }
  }
}
</script>
