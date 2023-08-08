<template>
  <content-page
    loadingMessage="Loading media library..."
    :loading="loading"
    :noContent="!mediaLibrary.length"
  >
    <template v-slot:header>Scenes</template>
    <template v-slot:no-content-header>No Scenes Found</template>
    <template v-slot:no-content-text>
      Would you like to create a new scene?
    </template>
    <template v-slot:no-content-cta>
      <v-btn @click="createNewScene">Create New Scene</v-btn>
    </template>
    <v-tabs v-model="tab" centered dark icons-and-text>
      <v-tabs-slider></v-tabs-slider>

      <v-tab href="#tab-1">
        Images
        <v-icon>mdi-image</v-icon>
      </v-tab>

      <v-tab href="#tab-2">
        Videos
        <v-icon>mdi-videos</v-icon>
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item value="tab-1">
        <image-library />
      </v-tab-item>
      <v-tab-item value="tab-2">
        <video-library />
      </v-tab-item>
    </v-tabs-items>
  </content-page>
</template>

<script>
import { mapActions } from "vuex";
import ImageLibrary from "../components/ImageLibrary.vue";
import VideoLibrary from "../components/VideoLibrary.vue";

export default {
  components: { VideoLibrary, ImageLibrary },
  name: "MediaLibrary",
  props: {
    folderPath: String,
  },
  data: () => ({}),
  methods: {
    ...mapActions({
      uploadImage: "media/uploadImage",
    }),
    folders() {
      return [];
    },
    images() {
      return [];
    },
  },
};
</script>
<style scoped>
.translucent {
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}
</style>
