<template>
  <v-container class="py-6 mx-auto">
    <v-row>
      <v-col no-gutters>
        <h1 class="text-h5 ml-2 mb-4">Scene Setup Instructions</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col no-gutters>
        <h1 class="text-h5 ml-2 mb-4">Install VLM Integration Package</h1>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "SceneSetup",

  data: () => ({
  }),
  props: {
    sceneId: {
      type: String,
      required: true,
    },
  },
  computed: {
    scene() {
      return this.$store.state.scene.activeScene;
    },
  },
  methods: {
    ...mapActions({
      showSuccess: "banner/showSuccess",
    })
  },
};
</script>
