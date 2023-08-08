<template>
  <content-sub-panel :loading="processing" :hasContent="!!videos?.length" loadingMessage="Loading video screens...">
    <template v-slot:header>
      <div>Video Screens</div>
      <v-spacer />
      <v-btn @click="addVideoScreen()" v-if="videos?.length">
        <v-icon class="mr-2">mdi-television</v-icon>
        New Video Screen
      </v-btn>
    </template>

    <template v-slot:no-content-header>No Video Screens Have Been Added</template>
    <template v-slot:no-content-text>Would you like to add one?</template>
    <template v-slot:no-content-cta>
      <v-btn @click="addVideoScreen()">
        <v-icon class="mr-2">mdi-television</v-icon>
        New Video Screen
      </v-btn>
    </template>

    <v-container fluid class="pa-0">
      <v-row>
        <v-col md="4" sm="6" xs="12" v-for="(video, i) in videos" :key="video.id">
          <scene-video-card :video="video" :i="i" />
        </v-col>
      </v-row>
    </v-container>
  </content-sub-panel>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import SceneVideoCard from "./SceneVideoCard";
import ContentSubPanel from "./ContentSubPanel";
import { SceneVideo } from "../models/SceneVideo";

export default {
  components: {
    ContentSubPanel,
    SceneVideoCard,
  },
  name: "SceneVideoList",
  computed: {
    ...mapGetters({
      videos: "scene/sceneVideos",
      processing: "scene/processing",
    }),
  },
  methods: {
    ...mapActions({
      createSceneElement: "scene/createSceneElement",
      updateSceneElement: "scene/updateSceneElement",
      deleteSceneElement: "scene/deleteSceneElement",
    }),
    addVideoScreen() {
      const elementData = new SceneVideo({ name: `Video Source ${this.videos.length + 1}` });
      this.createSceneElement({ element: "video", elementData });
    },
  },
};
</script>
