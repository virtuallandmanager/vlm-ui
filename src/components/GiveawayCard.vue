<template>
  <v-card class="grey darken-3 pa-2 text-center" max-width="25vh">
    <v-card-text>
      <div class="text-truncate">{{ giveaway?.name }}</div>
      <div class="text-caption text-center">{{ giveaway?.items.length }} Item</div>
      <giveaway-item-card v-for="(item, i) in giveaway.items" :key="i" :item="item" />
      <div v-if="finished" class="text-caption text-center">Ended {{ endTimeRelative }}</div>
    </v-card-text>
    <v-card-actions class="d-flex justify-space-around">
      <v-btn @click="router.push(`/giveaway/${giveaway.sk}`)">Edit</v-btn>
      <v-btn v-if="ongoing && !paused" @click="pauseGiveaway" color="yellow darken-4">Pause</v-btn>
      <v-btn v-if="!finished && paused" @click="resumeGiveaway" color="green darken-4">Resume</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import GiveawayItemCard from "./GiveawayItemCard";
import { DateTime } from "luxon";
export default {
  name: "GiveawayCard",
  components: { GiveawayItemCard },
  data: () => ({ imagePath: "../assets/" }),
  props: {
    event: Object,
    giveaway: Object,
  },
  computed: {
    ongoing() {
      return !this.finshed && this.event.startTime < Date.now() && this.event.endTime > Date.now();
    },
    paused() {
      return this.giveaway.paused;
    },
    finished() {
      return this.event.startTime < Date.now() && this.event.endTime && this.event.endTime < Date.now();
    },
    endTimeRelative() {
      return this.event.endTime ? DateTime.fromMillis(this.event.endTime + this.giveaway.endBuffer).toRelative() : "";
    },
  },
  methods: {
    pauseGiveaway() {},
    resumeGiveaway() {},
  },
};
</script>
