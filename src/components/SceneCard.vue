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
            <v-tooltip bottom v-if="dclLocations?.length">
              <template v-slot:activator="{ on, attrs }">
                <v-card class="d-flex align-center justify-center black pa-2" v-bind="attrs" v-on="on">
                  <img src="@/assets/dcl-logo-sm.png" width="20px" height="20px" class="mr-2" />
                  {{ dclLocations.length }} location{{ dclLocations.length == 1 ? '' : 's' }}
                  <div class="text-subtitle-2 font-weight-medium text-left" v-if="scene?.location?.parcels?.length">{{
                    `${scene?.location?.parcels?.length} Parcel` }}{{ scene?.parcels?.length > 1 ? "s" : "" }}</div>
                </v-card>
              </template>
              <div class="d-flex justify-center text-center" v-for="(location, i) of dclLocations" :key="i">
                <v-chip small class="text-caption ma-1"><v-icon x-small
                    v-if="location.includes('.dcl.eth')">mdi-web</v-icon>{{ location }}</v-chip>
              </div>
            </v-tooltip>
            <v-tooltip bottom v-if="hyperfyLocations?.length">
              <template v-slot:activator="{ on, attrs }">
                <v-card class="d-flex align-center justify-center black pa-2 mt-2" v-bind="attrs" v-on="on">
                  <img src="@/assets/hyperfy-logo-sm.png" width="20px" height="20px" class="mr-2" />
                  {{ hyperfyLocations.length }} location{{ hyperfyLocations.length == 1 ? '' : 's' }}
                  <div class="text-subtitle-2 font-weight-medium text-left" v-if="scene?.location?.parcels?.length">{{
                    `${scene?.location?.parcels?.length} Parcel` }}{{ scene?.parcels?.length > 1 ? "s" : "" }}</div>
                </v-card>
              </template>
              <div class="d-flex justify-center text-center" v-for="(location, i) of hyperfyLocations" :key="i">
                <v-chip small class="text-caption ma-1"><v-icon x-small>mdi-web</v-icon>{{ location }}</v-chip>
              </div>
            </v-tooltip>
            <v-card v-if="!scene?.locations?.length" class="d-flex align-center justify-center black pa-2">
              World Not Assigned
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import placeholderImage from "@/assets/placeholder.png";

export default {
  components: {},

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
        if (location?.realm?.serverName.includes(".dcl.eth")) {
          return location.realm.serverName;
        } else {
          return `${location.coordinates[0]},${location.coordinates[1]}`;
        }
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
