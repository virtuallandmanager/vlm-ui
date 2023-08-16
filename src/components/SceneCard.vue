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
          <v-col v-if="dclLocations?.length">
            <div class="d-flex">
              <img src="@/assets/dcl-logo-sm.png" width="20px" height="20px" class="mr-2" />
              <div class="text-subtitle-2 font-weight-medium text-left mr-2" v-for="(location, i) of dclLocations" :key="i">
                {{ location }}
                <div class="d-inline-block" v-if="location?.parcels?.length">
                  <parcel-map :scene="{ baseParcel: location.coordinates.join(','), parcels: location.parcels }"
                    :hideWrapper="true" class="ma-2 transparent" wrapperClass="text-right" />
                </div>
              </div>
            </div>
            <div class="d-flex" v-if="hyperfyLocations?.length">
              <img src="@/assets/hyperfy-logo-sm.png" width="20px" height="20px" class="mr-2" />
              <span class="text-subtitle-2 font-weight-medium text-left" v-for="(location, i) of hyperfyLocations"
                :key="i">
                {{ i == 0 ? "" : " - " }}{{ location }}
              </span>
            </div>
            <div class="text-subtitle-2 font-weight-medium text-left" v-if="scene?.parcels?.length">{{
              `${scene?.parcels?.length} Parcel` }}{{ scene?.parcels?.length > 1 ? "s" : "" }}</div>
          </v-col>
        </v-row>
        <v-row v-if="!scene?.locations || scene.locations.length < 1">
          <v-col>
            <div class="text-subtitle-2 font-weight-medium text-left">
              World Not Assigned
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
    dclLocations() {
      return this.scene?.locations?.filter((location) => location.world === "decentraland").map((location) => {
        return `${location.coordinates[0]},${location.coordinates[1]}`;
      });
    },
    hyperfyLocations() {
      return this.scene?.locations?.filter((location) => location.world === "hyperfy").map((location) => {
        return `${location.coordinates[0]},${location.coordinates[1]}`;
      });
    },
  }
};
</script>
