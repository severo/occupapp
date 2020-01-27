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
          @click="view = 'collaboration'"
          :disabled="view === 'collaboration'"
        >
          <v-icon>mdi-forum</v-icon>
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
        <CollaborationPanel v-if="view === 'collaboration'" />
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

import CollaborationPanel from '@/components/CollaborationPanel.vue'
import PointsList from '@/components/PointsList.vue'
import TablesPanel from '@/components/TablesPanel.vue'
import ImagesPanel from '@/components/ImagesPanel.vue'
import Infos from '@/components/Infos.vue'
import Main from '@/components/Main.vue'

import { Composition, UrlQuery } from '@/types'
import { parse } from '@/utils/parse.ts'

import { compositionsStore } from '@/store'

@Component({
  components: {
    CollaborationPanel,
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
  async mounted () {
    this.small = this.$vuetify.breakpoint.thresholds.md * 0.5
    this.barWidth = this.small

    // Process the query
    try {
      // Set the composition from the URL, or force setting the current one
      // to ensure everything to be initialized
      await compositionsStore.updateCurrentComposition(
        parse(this.$store.state.route.query) || compositionsStore.current
      )
      // TODO: empty URL
    } catch (e) {
      // Something went wrong during the URL parsing, or when setting the composition
      // TODO: show an error
      await compositionsStore.updateCurrentComposition(compositionsStore.current)
    }
  }

  // methods
  toggleFullscreen () {
    if (this.barWidth === this.small) {
      this.barWidth = this.big
    } else {
      this.barWidth = this.small
    }
  }

  // Query changes are watched inside the Home view, because the query is specific to this view
  // TODO: do a quick parsing, to see if the composition id has changed. If it has changed,
  // update the composition
  //
  // @Watch('$store.state.route.query')
  // async onQueryChange (query: UrlQuery, oldVal: UrlQuery) {
  //   // Process the query
  //   try {
  //     const newComposition = parse(query)
  //     if (newComposition !== undefined) {
  //       // A new composition has been found, load it
  //       await compositionsStore.updateCurrentComposition(newComposition)
  //       // TODO: empty URL
  //     }
  //     // else: nothing
  //   } catch (e) {
  //     // Something went wrong during the URL parsing, or when setting the composition
  //     // TODO: show an error
  //   }
  // }
}
</script>

<style lang="sass">
.v-content
  height: 100vh
#keep .v-app-bar .title
  color: inherit
  text-decoration: none
</style>
