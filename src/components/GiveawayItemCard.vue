<template>
  <v-card class="pb-3 mt-2 d-flex flex-column justify-center align-center text-center transparent" elevation="0">
    <v-img :src="item.imageLink" class="item-image mb-1" :class="bgColor" :width="size || 100" :height="size || 100" contain> </v-img>
    <div class="item-name mb-1">{{ itemData.name }}</div>
    <v-chip class="giveaway-item-data text-truncate mb-1" x-small>{{ item.claimCount }} claimed</v-chip>
    <v-chip class="giveaway-item-data text-truncate mb-1" x-small>{{ itemData.available }} remaining</v-chip>
  </v-card>
</template>

<script>
export default {
  name: "GiveawayItemCard",

  data: () => ({ imagePath: "../assets/", itemData: {} }),
  props: {
    item: Object,
    size: Number,
  },
  mounted() {
    this.loadItemInfo();
  },
  computed: {
    bgColor() {
      switch (this.itemData.rarity) {
        case "common":
          return "grey";
        case "uncommon":
          return "orange lighten-1";
        case "rare":
          return "green lighten-1";
        case "epic":
          return "blue lighten-1";
        case "legendary":
          return "blue lighten-1";
        case "mythic":
          return "pink lighten-1";
        default:
          return "transparent";
      }
    },
  },
  methods: {
    async loadItemInfo() {
      const response = await fetch(`https://nft-api.decentraland.org/v1/items?contractAddress=${this.item.contractAddress}&itemId=${this.item.itemId}`);
      const { data } = await response.json();
      this.itemData = data ? data.find((item) => item.contractAddress == this.item.contractAddress && item.itemId == this.item.itemId) : null;
    },
  },
};
</script>

<style scoped>
.giveaway-item-data {
  font-size: x-small;
  line-height: 12pt;
  margin: 0 auto;
}
</style>
