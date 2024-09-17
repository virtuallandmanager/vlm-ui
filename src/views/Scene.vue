<template>
  <focus-page
    :loadingMessage="`Connecting To ${scene?.name || 'Scene'}...`"
    :loading="loadingScene"
    :noContent="!scene"
    :imageLink="scene?.imageLink || placeholder"
  >
    <transform-dialog />
    <delete-dialog />
    <click-event-dialog />
    <properties-dialog />
    <template v-slot:header>{{ scene?.name }}</template>
    <template v-slot:header-actions>
      <div class="d-flex align-center" style="position: absolute">
        <v-btn v-if="isDemoScene" color="primary" @click="viewDemoScene" class="mr-2">{{ localeText('View Demo Scene') }}</v-btn>
        <v-btn v-else color="primary" @click="jumpIn(x, y)" class="mr-2">{{ localeText('Jump In') }}</v-btn>
        <v-spacer></v-spacer>
        <v-fade-transition>
          <v-chip v-if="connected" :color="connectedColor" :border-color="connectedColor">{{ localeText('Connected To Scene') }} </v-chip>
        </v-fade-transition>
      </div>
    </template>
    <template v-slot:no-content-header>{{ localeText('Could Not Load Scene') }} </template>
    <template v-slot:no-content-text> {{ localeText('NoDataTagline') }} </template>
    <v-card class="cyberpunk-border py-4">
      <v-tabs v-model="tab" centered icons-and-text center-active grow color="nav" :show-arrows="true">
        <v-tabs-slider />
        <v-tab href="#tab-1" class="text-overline">
          {{ localeText('Analytics') }}
          <v-icon small>mdi-chart-timeline-variant</v-icon>
        </v-tab>
        <v-tab href="#tab-2" class="text-overline">
          {{ localeText('Video Screens') }}
          <v-icon small>mdi-television</v-icon>
        </v-tab>
        <v-tab href="#tab-3" class="text-overline">
          {{ localeText('Art') }}
          <v-icon small>mdi-image-frame</v-icon>
        </v-tab>
        <v-tab href="#tab-4" class="text-overline">
          {{ localeText('3D Models') }}
          <v-icon small>mdi-cube-outline</v-icon>
        </v-tab>
        <v-tab href="#tab-5" class="text-overline">
          {{ localeText('Sounds') }}
          <v-icon small>mdi-speaker</v-icon>
        </v-tab>
        <v-tab href="#tab-6" class="text-overline">
          {{ localeText('Giveaways') }}
          <v-icon small>mdi-gift</v-icon>
        </v-tab>
        <v-tab href="#tab-7" v-if="isAdvancedUser" class="text-overline">
          {{ localeText('Widgets') }}
          <v-icon small>mdi-palette</v-icon>
        </v-tab>
        <v-tab href="#tab-8" class="text-overline">
          {{ localeText('Moderation') }}
          <v-icon small>mdi-gavel</v-icon>
        </v-tab>
        <v-tab href="#tab-9" class="text-overline">
          {{ localeText('Presets') }}
          <v-icon small>mdi-folder</v-icon>
        </v-tab>
        <v-tab href="#tab-10" class="text-overline">
          {{ localeText('Settings') }}
          <v-icon small>mdi-cog</v-icon>
        </v-tab>
      </v-tabs>
    </v-card>
    <v-spacer class="p"></v-spacer>
    <v-card class="cyberpunk-border pa-6 mt-4" v-if="loadingPreset">
      <loader :message="`Loading Preset...`" :loading="loadingPreset" :grid="true" />
    </v-card>
    <v-card class="cyberpunk-border pa-6 mt-4" v-else>
      <v-tabs-items v-model="tab">
        <v-tab-item value="tab-1">
          <scene-analytics />
        </v-tab-item>
        <v-tab-item value="tab-2">
          <scene-video-list />
        </v-tab-item>
        <v-tab-item value="tab-3">
          <scene-art-list />
        </v-tab-item>
        <v-tab-item value="tab-4">
          <scene-model-list />
        </v-tab-item>
        <v-tab-item value="tab-5">
          <scene-sound-list />
        </v-tab-item>
        <v-tab-item value="tab-6">
          <scene-giveaway-list />
        </v-tab-item>
        <v-tab-item value="tab-7" v-if="isAdvancedUser">
          <scene-widget-list />
        </v-tab-item>
        <v-tab-item value="tab-8">
          <scene-moderation />
        </v-tab-item>
        <v-tab-item value="tab-9">
          <scene-preset-list />
        </v-tab-item>
        <v-tab-item value="tab-10">
          <scene-settings />
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </focus-page>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { DateTime } from 'luxon'
import Loader from '../components/Loader'
import SceneAnalytics from '../components/SceneAnalytics'
import SceneArtList from '../components/SceneArtList'
import SceneVideoList from '../components/SceneVideoList'
import SceneGiveawayList from '../components/SceneGiveawayList'
import SceneSoundList from '../components/SceneSoundList'
import SceneModeration from '../components/SceneModeration'
import SceneModelList from '../components/SceneModelList'
import SceneWidgetList from '../components/SceneWidgetList'
import ScenePresetList from '../components/ScenePresetList'
import SceneSettings from '../components/SceneSettings'
import placeholderImg from '@/assets/placeholder.png'
import FocusPage from '../components/FocusPage'
import TransformDialog from '../components/dialogs/TransformDialog'
import PropertiesDialog from '../components/dialogs/PropertiesDialog'
import DeleteDialog from '../components/dialogs/DeleteDialog'
import ClickEventDialog from '../components/dialogs/ClickEventDialog'
import store from '../store'

export default {
  name: 'Scene',
  components: {
    SceneAnalytics,
    SceneArtList,
    SceneVideoList,
    SceneGiveawayList,
    SceneSettings,
    SceneWidgetList,
    ScenePresetList,
    SceneModelList,
    SceneSoundList,
    SceneModeration,
    FocusPage,
    TransformDialog,
    PropertiesDialog,
    ClickEventDialog,
    DeleteDialog,
    Loader,
  },
  data: () => ({
    editingName: false,
    deleteScreenDialog: false,
    updateHistoryDialog: false,
    editingScreenName: false,
    selectedPreset: null,
    tab: 'tab-2',
  }),
  beforeRouteEnter(to, from, next) {
    const isAuthenticated = store.getters['auth/authenticated']
    const hasSceneCache = store.getters['scene/sceneList'].length

    if (!isAuthenticated) {
      next('/') // Redirect to the login page if the user is not authenticated
    } else if (!hasSceneCache) {
      next('/scenes') // Redirect to the scenes page if the user has no scenes
    } else {
      next() // Continue rendering the component
    }
  },
  async mounted() {
    await this.connectToScene(this.$route.params.sceneId)
  },
  beforeDestroy() {
    this.clearActiveScene()
  },
  computed: {
    scenePreset() {
      if (!this.$store.state.scene.activeScene) {
        return {}
      }

      const activeScene = this.$store.state.scene.activeScene
      if (!activeScene) {
        return {}
      }
      const presetId = activeScene.scenePreset,
        preset = activeScene?.presets?.find((preset) => preset.sk == presetId),
        scenePresets = activeScene.presets || []

      return preset || scenePresets[0] || {}
    },
    hasGiveaways() {
      return this.giveawaysForScene(this.scene.sk)?.length
    },
    placeholder() {
      return placeholderImg
    },
    connectedColor() {
      let colors = { r: 100, g: 100, b: 100 }
      if (this.connected) {
        colors.g += 100
      } else {
        colors.r += 100
        colors.g -= 100
      }

      return `rgba(${colors.r},${colors.g},${colors.b},${this.blinkBrightness})`
    },
    worlds() {
      const worldNames = []
      if (this.scene.worlds) {
        this.scene.worlds.forEach((world) => {
          switch (world) {
            case 0:
              worldNames.push('Decentraland')
              break
            case 1:
              worldNames.push('Hyperfy')
          }
        })
      }
      return worldNames.join(', ') || 'None'
    },
    x() {
      const location = this.scene.locations.find((loc) => loc.world == 'decentraland')
      return location.coordinates[0]
    },
    y() {
      const location = this.scene.locations.find((loc) => loc.world == 'decentraland')
      return location.coordinates[1]
    },
    ...mapGetters({
      scene: 'scene/activeScene',
      user: 'user/userInfo',
      isAdvancedUser: 'user/isAdvancedUser',
      connected: 'scene/connected',
      isDemoScene: 'scene/isDemoScene',
      inBlink: 'scene/inBlink',
      outBlink: 'scene/outBlink',
      processing: 'scene/processing',
      loadingPreset: 'scene/loadingPreset',
      loadingPresetList: 'scene/loadingPresetList',
      loadingScene: 'scene/loadingScene',
      giveawaysForScene: 'event/giveawaysForScene',
      localeText: 'i18n/scene',
    }),
  },
  methods: {
    ...mapActions({
      create: 'scene/create',
      setActiveScene: 'scene/setActiveScene',
      clearActiveScene: 'scene/clearActiveScene',
      loadScenePreset: 'scene/loadScenePreset',
      updateScene: 'scene/updateScene',
      connectToScene: 'scene/connectToScene',
      sendUiMessage: 'moderation/sendUiMessage',
    }),
    getDateTime(timestamp) {
      return DateTime.fromMillis(timestamp).toLocaleString(DateTime.DATETIME_SHORT)
    },
    relDateTime(timestamp) {
      return DateTime.fromMillis(timestamp).toRelative()
    },
    viewDemoScene() {
      return window.open('https://decentraland.org/play?position=104%2C60')
    },
    jumpIn(x, y) {
      window.open(`https://decentraland.org/play?position=${x}%2C${y}`, '_blank')
    },
  },
}
</script>

<style scoped>
.visible {
  opacity: 1;
}

.hidden {
  opacity: 0;
}

.frosted {
  background-color: rgba(75, 75, 125, 0.3);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.cyberpunk-border {
  border: 1px solid rgb(128, 0, 255);
}
</style>
