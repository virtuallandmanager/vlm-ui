<template>
  <v-card class="text-center transparent" elevation="0">
    <v-card-text>
      Linked Giveaways: {{ event.giveaways.length }}<br />
      Total Giveaway Claims: {{ totalClaims }}
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "GiveawayStatsCard",

  data: () => ({ imagePath: "../assets/", itemData: {} }),
  props: {
    event: Object,
  },
  computed: {
    totalClaims() {
      const total = this.event.giveaways.reduce((accumulator, giveaway) => {
        return accumulator + giveaway.claimCount;
      }, 0);
      return total;
    },
  },
};
</script>
