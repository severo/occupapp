<template>
  <v-app id="keep">
    <v-navigation-drawer
      v-model="drawer"
      app
      right
      disable-resize-watcher
      :mobile-break-point="2*barWidth"
      :width="barWidth"
    >
      <v-toolbar light>
        <v-btn
          icon
          @click="drawer=false"
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

import PointsList from '@/components/PointsList.vue'
import TablesPanel from '@/components/TablesPanel.vue'
import ImagesPanel from '@/components/ImagesPanel.vue'
import Infos from '@/components/Infos.vue'
import Main from '@/components/Main.vue'

import { getModule } from 'vuex-module-decorators'

import { validateImageSrc } from '@/utils/img.ts'

import BackgroundImage from '@/store/current/backgroundImage.ts'
import Composition from '@/store/current/composition.ts'
import GalleryImages from '@/store/galleryImages.ts'
const backgroundImage = getModule(BackgroundImage)
const composition = getModule(Composition)
const galleryImages = getModule(GalleryImages)

export default Vue.extend({
  name: 'Home',
  data: () => ({
    small: 600,
    big: 6000,
    barWidth: 600,
    drawer: false,
    view: 'points'
  }),
  mounted: function () {
    this.small = this.$vuetify.breakpoint.thresholds.md * 0.5
    this.barWidth = this.small

    // Init the composition
    if (this.$store.state.route.query.imageSrc === undefined) {
      this.$router.push({ query: { ...this.$store.state.route.query, imageSrc: galleryImages.defaultSrc } })
    } else {
      this.setImageSrc(this.$store.state.route.query.imageSrc)
    }
  },
  components: {
    PointsList,
    TablesPanel,
    ImagesPanel,
    Infos,
    Main
  },
  computed: {
    viewTitle: function () {
      const titles: Map<string, string> = new Map([
        ['tables', 'Data Tables'],
        ['images', 'Background Image'],
        ['points', 'Points']
      ])
      return titles.get(this.view) || ''
    }
  },
  methods: {
    toggleFullscreen: function () {
      if (this.barWidth === this.small) {
        this.barWidth = this.big
      } else {
        this.barWidth = this.small
      }
    },
    setImageSrc: async function (src: string) {
      if (await validateImageSrc({ src })) {
        composition.fromSrc(src)
      } else {
        // force reload current image, or the default image if it doesn't exist
        this.$router.push({ query: { ...this.$store.state.route.query, imageSrc: backgroundImage.image.src || galleryImages.defaultSrc } })
      }
    }
  },
  watch: {
    '$store.state.route.query.imageSrc' (src) {
      this.setImageSrc(src)
    }
  }
})
</script>

<style lang="sass">
  .v-content
    height: 100vh
  #keep .v-app-bar .title
    color: inherit
    text-decoration: none
</style>
