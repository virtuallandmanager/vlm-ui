<template>
  <div>
    <v-dialog v-model="mintingRightsDialog" max-width="390">
      <v-card>
        <v-card-title>Grant Minting Rights</v-card-title>
        <v-card-text>
          <div class="text-body-1">This giveaway item requires minting rights to be granted to the giveaway contract address.</div>
          <div class="text-body-1">Please grant minting rights to the giveaway address and then refresh this page.</div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" text @click="mintingRightsDialog = false"> OK </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-card elevation="0" class="d-flex flex-column flex-grow-1 align-center grey darken-2 pa-3">
      <div class="text-h6 item-name mb-1 flex-grow-1">{{ item.name }}</div>
      <v-container>
        <v-row>
          <v-col>
            <div class="d-flex flex-column justify-center align-center">
              <v-img :src="item.imageSrc" class="item-image mb-1" :class="bgColor" :width="size || 100" :height="size || 100" contain> </v-img>
              <v-chip class="giveaway-item-data text-truncate mb-1" x-small>{{ item.rarity.capitalize() }} {{ item.category.capitalize() }}</v-chip>
            </div>
          </v-col>
          <v-col class="d-flex justify-center align-start flex-grow-1">
            <claim-limits :itemName="item.name" :claimLimits="claimLimits" @updateClaimLimits="saveClaimLimits" />
          </v-col>
        </v-row>
      </v-container>
      <v-container>
        <v-row>
          <v-col>
            <div class="d-flex flex-column align-center flex-grow-1">
              <div class="text-display">{{ item.claimCount }} of {{ claimLimits?.total || totalSupply }} claimed</div>
              <div class="text-display">{{ itemData.available }} left to mint</div>
              <v-btn x-small class="mt-2" @click="removeGiveawayItem">Remove Item</v-btn>
            </div>
          </v-col>
          <v-col class="d-flex justify-center align-end flex-grow-1">
            <v-btn v-if="hasMinterRights" x-small class="mt-2" color="green">Minting Rights Granted</v-btn>
            <v-btn v-else x-small class="mt-2" @click="showMintingRightsDialog">Grant Minting Rights</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </div>
</template>

<script>
import ClaimLimits from './ClaimLimits'
import { mapGetters } from 'vuex'
export default {
  name: 'GiveawayItemCard',
  components: { ClaimLimits },
  data: () => ({ editing: false, imagePath: '../assets/', itemData: {}, claimLimits: {}, mintingRightsDialog: false }),
  props: {
    item: Object,
    size: Number,
  },
  mounted() {
    this.claimLimits = this.item.claimLimits || {}
    this.loadItemInfo()
  },
  beforeUpdate() {
    this.claimLimits = this.item.claimLimits || {}
  },
  computed: {
    ...mapGetters({
      activeGiveaway: 'giveaway/activeGiveaway',
      grantedMinterRights: 'giveaway/grantedMinterRights',
    }),
    hasMinterRights() {
      return this.grantedMinterRights.includes(`${this.item.contractAddress}:${this.item.itemId}`)
    },
    bgColor() {
      switch (this.item.rarity) {
        case 'common':
          return 'grey'
        case 'uncommon':
          return 'orange lighten-1'
        case 'rare':
          return 'green lighten-1'
        case 'epic':
          return 'blue lighten-1'
        case 'legendary':
          return 'purple lighten-1'
        case 'mythic':
          return 'pink lighten-1'
        default:
          return 'transparent'
      }
    },
    totalSupply() {
      switch (this.item.rarity) {
        case 'common':
          return 100000
        case 'uncommon':
          return 10000
        case 'rare':
          return 5000
        case 'epic':
          return 1000
        case 'legendary':
          return 100
        case 'mythic':
          return 10
        default:
          return 'Unknown Supply'
      }
    },
  },
  methods: {
    async loadItemInfo() {
      const response = await fetch(
        `https://nft-api.decentraland.org/v1/items?contractAddress=${this.item.contractAddress}&itemId=${this.item.itemId}`
      )
      const { data } = await response.json()
      this.itemData = data ? data.find((item) => item.contractAddress == this.item.contractAddress && item.itemId == this.item.itemId) : null
    },
    async removeGiveawayItem() {
      this.$emit('removeGiveawayItem', this.item)
    },
    showClaimLimits() {
      this.editing = true
      this.$emit('showClaimLimits', this.item)
    },
    async saveClaimLimits() {
      this.editing = false
      this.$emit('saveClaimLimits', this.item, this.claimLimits)
    },
    showMintingRightsDialog() {
      this.mintingRightsDialog = true
    },
  },
}
</script>

<style scoped>
.giveaway-item-data {
  font-size: x-small;
  line-height: 12pt;
  margin: 0 auto;
}

.aligned-text ::v-deep input {
  text-align: right;
}
</style>
