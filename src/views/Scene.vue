<template>
  <focus-page :loadingMessage="`Connecting To ${scene.name || 'Scene'}...`" :loading="processing || loadingPreset"
    :noContent="!scene" :imageLink="scene?.imageLink || placeholder">
    <transform-dialog />
    <delete-dialog />
    <click-event-dialog />
    <properties-dialog />
    <template v-slot:header>{{ scene?.name }}</template>
    <template v-slot:header-actions>
      <div class="d-flex align-center" style="position: absolute">
        <v-btn v-if="isDemoScene" color="primary" @click="viewDemoScene" class="mr-2">VIEW DEMO SCENE</v-btn>
        <v-spacer></v-spacer>
        <v-fade-transition>
          <v-chip v-if="connected" :color="connectedColor" :border-color="connectedColor">Connected To Scene </v-chip>
        </v-fade-transition>
      </div>
    </template>
    <template v-slot:no-content-header>Could Not Load Scene</template>
    <template v-slot:no-content-text> Please try again and contact support if the problem continues. </template>
    <v-card class="cyberpunk-border py-4">
      <v-tabs v-model="tab" centered icons-and-text center-active grow color="nav" :show-arrows="true">
        <v-tabs-slider />
        <v-tab href="#tab-1" disabled>
          Analytics (Coming Soon)
          <v-icon>mdi-chart-timeline-variant</v-icon>
        </v-tab>
        <v-tab href="#tab-2">
          Video Screens
          <v-icon>mdi-television</v-icon>
        </v-tab>
        <v-tab href="#tab-3">
          Art
          <v-icon>mdi-image-frame</v-icon>
        </v-tab>
        <!--<v-tab href="#tab-4">
          Sounds
          <v-icon>mdi-speaker</v-icon>
        </v-tab>
        -->
        <!-- <v-tab href="#tab-5">
              Events
              <v-icon>mdi-balloon</v-icon>
            </v-tab> -->
        <v-tab href="#tab-6" v-if="isAdvancedUser">
          Widgets
          <v-icon>mdi-palette</v-icon>
        </v-tab>
        <v-tab href="#tab-7">
          Presets
          <v-icon>mdi-folder</v-icon>
        </v-tab>
        <v-tab href="#tab-8">
          Settings
          <v-icon>mdi-cog</v-icon>
        </v-tab>
      </v-tabs>
    </v-card>
    <v-spacer class="p"></v-spacer>
    <v-card class="cyberpunk-border pa-6 mt-4">
      <v-tabs-items v-model="tab">
        <!-- <v-tab-item value="tab-1"> -->
        <!-- <scene-analytics /> -->
        <!-- </v-tab-item> -->
        <v-tab-item value="tab-2">
          <scene-video-list />
        </v-tab-item>
        <v-tab-item value="tab-3">
          <scene-art-list />
        </v-tab-item>
        <!-- <v-tab-item value="tab-4">
          <scene-sound-list />
        </v-tab-item> -->
        <v-tab-item value="tab-5">
          <scene-event-list />
        </v-tab-item>
        <v-tab-item value="tab-6" v-if="isAdvancedUser">
          <scene-widget-list />
        </v-tab-item>
        <v-tab-item value="tab-7">
          <scene-preset-list />
        </v-tab-item>
        <v-tab-item value="tab-8">
          <scene-settings />
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </focus-page>
</template>

<script>
// import SceneAnalytics from "../components/SceneAnalytics";
import SceneArtList from "../components/SceneArtList";
import SceneVideoList from "../components/SceneVideoList";
import SceneEventList from "../components/SceneEventList";
// import SceneSoundList from "../components/SceneSoundList";
import SceneWidgetList from "../components/SceneWidgetList";
import ScenePresetList from "../components/ScenePresetList";
// import SceneModeration from "../components/SceneModeration";
import SceneSettings from "../components/SceneSettings";
// import ImageLibrary from "../components/ImageLibrary";
import { mapActions, mapGetters } from "vuex";
import { DateTime } from "luxon";
import placeholderImg from "@/assets/placeholder.png";
import FocusPage from "../components/FocusPage";
import TransformDialog from "../components/dialogs/TransformDialog";
import PropertiesDialog from "../components/dialogs/PropertiesDialog";
import DeleteDialog from "../components/dialogs/DeleteDialog";
import ClickEventDialog from "../components/dialogs/ClickEventDialog";
import store from "../store";

export default {
  name: "Scene",
  components: {
    SceneArtList,
    SceneVideoList,
    SceneEventList,
    SceneSettings,
    SceneWidgetList,
    ScenePresetList,
    FocusPage,
    TransformDialog,
    PropertiesDialog,
    ClickEventDialog,
    DeleteDialog,
  },
  data: () => ({
    editingName: false,
    deleteScreenDialog: false,
    updateHistoryDialog: false,
    editingScreenName: false,
    selectedPreset: null,
    tab: "tab-2",
  }),
  beforeRouteEnter(to, from, next) {
    const isAuthenticated = store.getters["auth/authenticated"];

    if (!isAuthenticated) {
      next("/"); // Redirect to the login page if the user is not authenticated
    } else {
      next(); // Continue rendering the component
    }
  },
  async mounted() {
    await this.connectToScene(this.$route.params.sceneId);
  },
  beforeDestroy() { },
  computed: {
    scene() {
      return this.$store.state.scene.activeScene || {};
    },
    scenePreset() {
      if (!this.$store.state.scene.activeScene) {
        return {};
      }

      const activeScene = this.$store.state.scene.activeScene;
      if (!activeScene) {
        return {};
      }
      const presetId = activeScene.scenePreset,
        preset = activeScene?.presets?.find((preset) => preset.sk == presetId),
        scenePresets = activeScene.presets || [];

      return preset || scenePresets[0] || {};
    },
    placeholder() {
      return placeholderImg;
    },
    connectedColor() {
      let colors = { r: 100, g: 100, b: 100 };
      if (this.connected) {
        colors.g += 100;
      } else {
        colors.r += 100;
        colors.g -= 100;
      }

      return `rgba(${colors.r},${colors.g},${colors.b},${this.blinkBrightness})`;
    },
    worlds() {
      const worldNames = [];
      if (this.scene.worlds) {
        this.scene.worlds.forEach((world) => {
          switch (world) {
            case 0:
              worldNames.push("Decentraland");
              break;
            case 1:
              worldNames.push("Hyperfy");
          }
        });
      }
      return worldNames.join(", ") || "None";
    },
    ...mapGetters({
      user: "user/userInfo",
      isAdvancedUser: "user/isAdvancedUser",
      connected: "scene/connected",
      isDemoScene: "scene/isDemoScene",
      inBlink: "scene/inBlink",
      outBlink: "scene/outBlink",
      processing: "scene/processing",
      loadingPreset: "scene/loadingPreset"
    }),
  },
  methods: {
    ...mapActions({
      create: "scene/create",
      setActiveScene: "scene/setActiveScene",
      clearActiveScene: "scene/clearActiveScene",
      loadScenePreset: "scene/loadScenePreset",
      updateScene: "scene/updateScene",
      connectToScene: "scene/connectToScene",
      sendUiMessage: "moderation/sendUiMessage",
    }),
    getDateTime(timestamp) {
      return DateTime.fromSeconds(timestamp).toLocaleString(DateTime.DATETIME_SHORT);
    },
    relDateTime(timestamp) {
      return DateTime.fromSeconds(timestamp).toRelative();
    },
    viewDemoScene() {
      return window.open("https://play.decentraland.org/?position=104%2C60")
    }
  },
};
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
