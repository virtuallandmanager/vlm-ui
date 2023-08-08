<template>
  <focus-page :loadingMessage="`Loading ${scene?.name}`" :loading="false" :noContent="!scene" :imageLink="scene?.imageLink || placeholder">
    <template v-slot:header>{{ scene?.name }}</template>
    <template v-slot:no-content-header>Could Not Load Scene</template>
    <template v-slot:no-content-text> Please try again and contact support if the problem continues. </template>
    <template v-slot:no-content-cta>
      <v-btn @click="connectScene">Connect Scene</v-btn>
    </template>
    <v-card class="cyberpunk-border d-flex flex-row mx-3">
      <v-card-text>
        <div>
          <div class="text-caption">Created {{ relDateTime(scene.createdAt) }}</div>
          <div class="text-caption">Last Updated by {{ null }} {{ null }}</div>
          <v-btn></v-btn>
        </div>
      </v-card-text>
      <v-card-actions class="d-flex flex-column flex-space-between">
        <v-btn>Admin Access</v-btn>
        <v-btn>Team Access</v-btn>
      </v-card-actions>
    </v-card>
    <v-container>
      <v-row>
        <v-col>
          <v-card class="text-center">
            <v-card-title>Images & Artwork<v-spacer/>
              <v-btn  @click="addNft" class="mr-2"><v-icon>mdi-plus</v-icon> NFT</v-btn>
              <v-btn @click="addImage"><v-icon>mdi-plus</v-icon> Image</v-btn>
            </v-card-title>
          </v-card>
        </v-col>
        <v-col>
          <v-card class="text-center">
            <v-card-title>
              Video Screens
              <v-spacer />
              <v-btn><v-icon>mdi-plus</v-icon> Video</v-btn>
            </v-card-title>
          </v-card>
        </v-col>
        <v-col>
          <v-card class="text-center">
            <v-card-title>
              Presets
              <v-spacer />
              <v-btn><v-icon class="mr-2">mdi-plus</v-icon> Preset</v-btn>
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <!-- <scene-analytics v-if="true" /> -->
    <!-- <scene-video-list v-if="false" /> -->
    <!-- <scene-image-list v-if="false" /> -->
    <!-- <scene-widgets-list v-if="false" /> -->
    <!-- <image-library v-if="false" /> -->
    <!-- <scene-settings v-if="false" /> -->
  </focus-page>
</template>

<script>
// import SceneAnalytics from "../components/SceneAnalytics";
// import SceneDialogList from "../components/SceneDialogList";
// import SceneImageList from "../components/SceneImageList";
// import SceneVideoList from "../components/SceneVideoList";
// import SceneModeration from "../components/SceneModeration";
// import SceneSettings from "../components/SceneSettings";
// import ImageLibrary from "../components/ImageLibrary";
// import SceneWidgetsList from "../components/SceneCustomizationList";
import { mapActions, mapGetters } from "vuex";
import { DateTime } from "luxon";
import placeholderImg from "@/assets/placeholder.png";
import FocusPage from "../components/FocusPage.vue";

export default {
  name: "SceneSettings",
  components: {
    // SceneAnalytics,
    // SceneDialogList,
    // SceneImageList,
    // SceneVideoList,
    // SceneModeration,
    // ImageLibrary,
    // SceneSettings,
    // SceneWidgetsList,
    FocusPage,
  },
  data: () => ({
    showParcelMap: false,
    editingName: false,
    deleteScreenDialog: false,
    updateHistoryDialog: false,
    editingScreenName: false,
    tab: null,
  }),

  async mounted() {
    await this.setActiveScene(this.$route.params.sceneId);
  },
  beforeDestroy() {
    this.clearActiveScene();
  },
  computed: {
    scene() {
      return this.$store.state.scene.activeScene;
    },
    placeholder() {
      return placeholderImg;
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
    ...mapGetters({ user: "user/userInfo" }),
  },
  methods: {
    ...mapActions({
      create: "scene/create",
      setActiveScene: "scene/setActiveScene",
      clearActiveScene: "scene/clearActiveScene",
      updateScene: "scene/updateScene",
      getScene: "scene/getScene",
      sendUiMessage: "moderation/sendUiMessage",
    }),
    sendMessage(options) {
      this.sendUiMessage({
        wssMessages: {
          ...options.wssMessages,
        },
        scene: {
          sceneName: this.scene.sceneName,
          baseParcel: this.scene.baseParcel,
          sceneData: this.scene.sceneData,
          tokenId: this.scene.tokenId,
        },
      });
    },
    goBack() {
      this.$router.go(-1);
    },
    connectScene() {
      return false;
    },
    getDateTime(timestamp) {
      return DateTime.fromSeconds(timestamp).toLocaleString(DateTime.DATETIME_SHORT);
    },
    relDateTime(timestamp) {
      return DateTime.fromSeconds(timestamp).toRelative();
    },
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
