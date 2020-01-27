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
import { Point, Category } from '@/types'

import { categoriesStore, pointsStore } from '@/store'

@Component({
  components: {
    HotTable
  }
})
export default class PointsTable extends Vue {
  get colFields () {
    return ['number', 'color', 'x', 'y']
  }
  get pointsAsObject () {
    return pointsStore.asArray.map(p => {
      return {
        ...p,
        color: categoriesStore.getColor(p.categoryId)
      }
    })
  }
  get hotSettings () {
    return {
      data: this.pointsAsObject,
      colHeaders: this.colFields,
      columns: [
        { data: 'number', readOnly: true },
        { data: 'color', readOnly: true },
        { data: 'x', readOnly: true },
        { data: 'y', readOnly: true }
      ],
      rowHeaders: true,
      height: 'auto',
      licenseKey: 'non-commercial-and-evaluation'
    }
  }
}
</script>
