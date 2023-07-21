<template>
  <v-container class="py-6 mx-auto">
    <v-row>
      <v-col no-gutters>
        <h1 class="text-h5 ml-2 mb-4">Scene Settings</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <div class="text-display">Scene Details</div>
        <v-text-field label="Scene Name" outlined />
        <div class="text-display">Scene Image</div>
        <v-img :src="scene.imageLink" v-if="scene.imageLink" />
        <v-btn :src="scene.imageLink" v-if="!scene.imageLink">
          <v-icon>mdi-upload</v-icon>
          Upload Image
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "SceneSettings",

  data: () => ({}),
  computed: {
    scene() {
      return this.$store.state.scene.activeScene;
    },
  },
  methods: {},
};
</script>
