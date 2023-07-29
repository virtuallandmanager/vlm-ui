<template>
  <v-container class="py-6 mx-auto">
    <v-row>
      <v-col no-gutters>
        <h1 class="text-h5 ml-2 mb-4">Scene Settings</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field label="Scene Name" outlined v-model="scene.name" />
        <div class="text-display">Scene Image</div>
        <v-img :src="scene.imageSrc" v-if="scene.imageSrc" />
        <v-btn :src="scene.imageSrc" v-if="!scene.imageSrc">
          <v-icon>mdi-upload</v-icon>
          Upload Image
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "SceneSettings",

  data: () => ({}),
  computed: {
    scene() {
      return this.$store.state.scene.activeScene;
    },
  },
  methods: {
    ...mapActions({
      showTransformDialog: "dialog/showTransformDialog",
      showPropertiesDialog: "dialog/showPropertiesDialog",
      showClickEventDialog: "dialog/showClickEventDialog",
      showDeleteDialog: "dialog/showDeleteDialog",
      createSceneElement: "scene/createSceneElement",
      updateSceneElement: "scene/updateSceneElement",
      deleteSceneElement: "scene/deleteSceneElement",
      uploadImage: "media/uploadSceneImage",
    }),
  },
};
</script>
