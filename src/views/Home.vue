<template>
  <v-app id="keep">
    <v-navigation-drawer
      v-model="drawer"
      app
      right
      disable-resize-watcher
      :mobile-break-point="2 * barWidth"
      :width="barWidth"
    >
      <v-toolbar light>
        <v-btn
          icon
          @click="drawer = false"
        >
          <v-icon>
            mdi-exit-to-app
          </v-icon>
        </v-btn>
        <v-toolbar-title>{{ viewTitle }}</v-toolbar-title>

        <v-spacer />
        <v-btn
          icon
          @click="view = 'points'"
          :disabled="view === 'points'"
        >
          <v-icon>mdi-map-marker-circle</v-icon>
        </v-btn>
        <v-btn
          icon
          @click="view = 'tables'"
          :disabled="view === 'tables'"
        >
          <v-icon>mdi-table-large</v-icon>
        </v-btn>
        <v-btn
          icon
          @click="view = 'images'"
          :disabled="view === 'images'"
        >
          <v-icon>mdi-image</v-icon>
        </v-btn>
        <v-btn
          icon
          @click="toggleFullscreen()"
          v-if="$vuetify.breakpoint.smAndUp"
        >
          <v-icon>mdi-fullscreen</v-icon>
        </v-btn>
        <v-app-bar-nav-icon @click="drawer = !drawer" />
      </v-toolbar>

      <v-container pa-2>
        <PointsList v-if="view === 'points'" />
        <ImagesPanel v-if="view === 'images'" />
        <TablesPanel v-if="view === 'tables'" />
      </v-container>

      <template v-slot:append>
        <v-divider />
        <Infos />
      </template>
    </v-navigation-drawer>

    <v-app-bar
      app
      clipped-right
      color="amber"
    >
      <a
        href="/"
        class="title ml-3 mr-5"
      >
        Occupapp&nbsp;<span class="font-weight-light">Voronoï</span>
      </a>
      <v-spacer />

      <v-app-bar-nav-icon @click="drawer = !drawer" />
    </v-app-bar>

    <!-- Sizes your content based upon application components -->
    <v-content>
      <v-fade-transition mode="out-in">
        <Main />
      </v-fade-transition>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'

import PointsList from '@/components/PointsList.vue'
import TablesPanel from '@/components/TablesPanel.vue'
import ImagesPanel from '@/components/ImagesPanel.vue'
import Infos from '@/components/Infos.vue'
import Main from '@/components/Main.vue'

import { Composition, UrlQuery } from '@/utils/types.ts'
import { parse } from '@/utils/urlQuery.ts'

import BackgroundImage from '@/store/current/backgroundImage.ts'
import Compositions from '@/store/compositions.ts'
import PointsMetrics from '@/store/current/pointsMetrics.ts'
import PointsSelection from '@/store/current/pointsSelection.ts'

const backgroundImage = getModule(BackgroundImage)
const compositions = getModule(Compositions)
const pointsMetrics = getModule(PointsMetrics)
const pointsSelection = getModule(PointsSelection)

@Component({
  components: {
    PointsList,
    TablesPanel,
    ImagesPanel,
    Infos,
    Main
  }
})
export default class Home extends Vue {
  // local data
  small = 600
  big = 6000
  barWidth = 600
  drawer = false
  view = 'points'

  // computed
  get viewTitle (): string {
    const titles: Map<string, string> = new Map([
      ['tables', 'Data Tables'],
      ['images', 'Background Image'],
      ['points', 'Points']
    ])
    return titles.get(this.view) || ''
  }

  // lifecycle hook
  mounted () {
    this.small = this.$vuetify.breakpoint.thresholds.md * 0.5
    this.barWidth = this.small

    // Process the query
    this.processQuery(this.$store.state.route.query)
  }

  // methods
  toggleFullscreen () {
    if (this.barWidth === this.small) {
      this.barWidth = this.big
    } else {
      this.barWidth = this.small
    }
  }

  async processQuery (query: UrlQuery) {
    // Note: the "parse" method is allowed to reroute to a different URL to fix parameters
    const composition: Composition | undefined = await parse(query)
    if (composition !== undefined) {
      // A new composition has been parsed successfully from the query

      // Clear the temporary state data
      pointsSelection.clear()
      // Set the composition
      compositions.setCurrent(composition)
      // Update the cached state data
      await backgroundImage.fromImageSpec(compositions.current.backgroundImage)
      pointsMetrics.clear()
    }
  }

  // Query changes are watched inside the Home view, because the query is specific to this view
  @Watch('$store.state.route.query')
  async onQueryChange (query: UrlQuery, oldVal: UrlQuery) {
    this.processQuery(query)
  }
}
</script>

<style lang="sass">
.v-content
  height: 100vh
#keep .v-app-bar .title
  color: inherit
  text-decoration: none
</style>
