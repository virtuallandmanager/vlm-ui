<template>
  <v-card class="grey darken-3" elevation="2">
    <v-img :src="giveaway?.imageSrc || giveawayImgPlaceholder" lazy-src="@/assets/placeholder.png" max-height="250"
      class="text-right">
      <div class="d-flex">
        <v-chip class="orange ma-4 black--text" v-if="paused"><span><v-icon class="black--text">mdi-pause</v-icon>
            Paused</span></v-chip>
        <v-spacer></v-spacer>
        <v-chip v-if="giveaway?.allocatedCredits" class="grey ma-4 black--text"><span>{{ giveaway?.allocatedCredits }}
            Credits</span></v-chip>
      </div>
      <template v-slot:placeholder>
        <v-row class="d-flex fill-height ma-0 align-center justify-center">
          <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
        </v-row>
      </template>
    </v-img>
    <v-card-text class="pa-2">
      <v-container>
        <v-row>
          <v-col>
            <div class="text-h5 text-left text-truncate">
              {{ giveaway?.name || "Loading..." }}
            </div>
            <div class="text-subtitle-2 font-weight-medium text-right mb-2"></div>
            <div class="text-subtitle-2 font-weight-light text-left">
              <span v-if="giveaway?.items?.length">Sends {{ giveaway.items.length }} Item{{ giveaway.items.length !== 1 ? 's' : '' }}</span>
              <span v-else>No Giveaway Items Configured</span>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import imgPlaceholder from "@/assets/placeholder.png";
import { DateTime } from "luxon";

export default {
  name: "GiveawayCard",

  data: () => ({ imagePath: "../assets/" }),
  props: {
    giveaway: Object,
  },
  computed: {
    giveawayImgPlaceholder() {
      return imgPlaceholder;
    },
    startTime() {
      if (!this.giveaway?.startTime) {
        return "";
      }
      return DateTime.fromMillis(this.giveaway.startTime).toLocaleString();
    },
    startTimeString() {
      if (!this.giveaway?.startTime) {
        return "";
      }
      return DateTime.fromMillis(this.giveaway.startTime).toRelative();
    },
    endTime() {
      if (!this.giveaway?.endTime) {
        return "";
      }
      return DateTime.fromMillis(this.giveaway.endTime).toLocaleString();
    },
    endTimeString() {
      if (!this.giveaway?.endTime) {
        return "";
      }
      return DateTime.fromMillis(this.giveaway.endTime).toRelative();
    },
    paused() {
      return this.giveaway?.paused;
    },
    future() {
      return DateTime.now().toMillis() < this.giveaway.startTime;
    },
    past() {
      return DateTime.now().toMillis() > this.giveaway.endTime;
    },
  },
};
</script>
