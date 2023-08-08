<template>
  <v-card class="grey darken-3" elevation="2">
    <v-img :src="scene?.imageLink || sceneImgPlaceholder" lazy-src="@/assets/placeholder.png" max-height="250">
      <template v-slot:placeholder>
        <v-row class="d-flex fill-height ma-0 align-center justify-center">
          <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
        </v-row>
      </template>
    </v-img>
    <v-card-text class="pa-2">
      <v-container>
        <v-row>
          <v-col cols="12">
            <div class="text-h6 font-weight-light text-left">
              {{ scene.name || "New Scene" }}
            </div>
          </v-col>
          <v-col>
            <div class="text-subtitle-2 font-weight-medium text-left">
              {{ worlds || "World Not Assigned" }}
            </div>
            <div class="text-subtitle-2 font-weight-medium text-left" v-if="scene?.parcels?.length">{{ `${scene?.parcels?.length} Parcel` }}{{ scene?.parcels?.length > 1 ? "s" : "" }}</div>
          </v-col>
          <v-col class="text-right">
            <div class="d-inline-block" v-if="scene?.parcels?.length">
              <parcel-map :scene="scene" :hideWrapper="true" class="ma-2 transparent" wrapperClass="text-right" />
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import ParcelMap from "./ParcelMap";
import placeholderImage from "@/assets/placeholder.png";

export default {
  components: { ParcelMap },

  name: "SceneCard",

  data: () => ({ imagePath: "../assets/" }),
  props: {
    scene: Object,
  },
  computed: {
    sceneImgPlaceholder() {
      return placeholderImage;
    },
    worlds() {
      return this.scene.worlds.map((world) => world.charAt(0).toUpperCase() + world.slice(1)).join(", ");
    },
  },
};
</script>
