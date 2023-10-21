<template>
  <div>
    <content-page loadingMessage="Loading Giveaways..." :loading="loadingGiveaways" :noContent="!giveaways?.length">
      <template v-slot:contextual-content>
        <v-card class="cyberpunk-border frosted">
          <v-card-title class="text-h5">
            <v-icon class="mr-2">mdi-wallet</v-icon>Credits
          </v-card-title>
          <v-card-text class="d-flex">

            <v-card class="pa-4 frosted mr-6 d-flex flex-column">
              <v-card-text class="flex-grow-1 d-flex flex-column justify-center">
                <div class="text-h4">{{ userAirdropCredits }}</div>
                <div class="text-h6">Available Credits</div>
                <div class="text-display">—</div>
                <div class="text-h4">{{ allocatedAirdropCredits }}</div>
                <div class="text-h6">Allocated Credits</div>
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary" @click="openAllocationDialog">Allocate Credits</v-btn>
                <v-btn color="primary" @click="openClaimDialog" disabled>Buy More Credits</v-btn>
              </v-card-actions>
            </v-card>
            <v-card class="pa-4 frosted" v-if="hasDeployedDCLScene">
              <v-card-text class="flex-grow-1">
                <div class="text-h6 mb-4">The Great Decentraland Airdrop</div>
                <div class="text-display mb-4" v-if="userUnclaimedGdaCredits">You have deployed a
                  <strong>Decentraland</strong> scene, which makes you
                  eligible for complimentary giveaway credits!
                </div>
                <div class="text-display mb-4" v-else>You have already claimed your 10,000 complimentary credits. <br />
                  Thanks for participating in the Great Decentraland Airdrop!
                </div>
                <div class="text-display mb-4" v-if="userUnclaimedGdaCredits">You have <strong>{{ userUnclaimedGdaCredits
                }}</strong> Promotional Credits
                  left
                  to claim.</div>
              </v-card-text>
              <v-card-actions class="d-flex justify-center">
                <v-btn color="primary" @click="openClaimDialog" v-if="userUnclaimedGdaCredits">Claim Free Credits</v-btn>
              </v-card-actions>
            </v-card>

          </v-card-text>
        </v-card>
      </template>
      <template v-slot:header>Giveaways</template>
      <template v-slot:header-actions>
        <v-btn @click="createGiveaway" class="mr-2">Create New Giveaway</v-btn>
      </template>
      <template v-slot:no-content-header>No Giveaways Found</template>
      <template v-slot:no-content-text>
        Would you like to create a new giveaway?
      </template>
      <template v-slot:no-content-cta>
        <v-btn @click="createGiveaway">Create New Giveaway</v-btn>
      </template>
      <v-container fluid>
        <v-row class="text-center" v-if="!loadingGiveaways">
          <v-col md="4" sm="6" xs="12" v-for="(giveaway, i) in giveaways" :key="i">
            <router-link :to="`giveaway/${giveaway?.sk}`" class="giveaway-card-link">
              <giveaway-card :giveaway="giveaway" />
            </router-link>
          </v-col>
        </v-row>
      </v-container>
    </content-page>
    <v-dialog v-model="airdropClaimDialog" width="500">
      <v-card>
        <v-card-title class="text-h5">
          Decentraland Airdrop Claim
        </v-card-title>

        <v-card-text class="d-flex flex-column justify-center">
          <div class="text-h6 text-center">Credits To Claim</div>
          <v-btn-toggle v-model="selectedClaimAmount" outlined class="d-block text-center mb-4" exclusive mandatory>
            <v-btn>
              100
            </v-btn>
            <v-btn>
              1000
            </v-btn>
            <v-btn>
              5000
            </v-btn>
            <v-btn>
              10000
            </v-btn>
          </v-btn-toggle>
          <div class="text-display text-left">Thanks to a grant from the Decentraland DAO, your deployed Decentraland
            scene allows you to claim up to 10,000 complimentary Airdrop Credits.</div>
          <div class="text-display text-right" v-if="userUnclaimedGdaCredits"> <strong>Promotional Credits
              Remaining:</strong>
            {{ userUnclaimedGdaCredits }}
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="claimAirdropCredits">
            Claim
          </v-btn>
          <v-btn color="grey" text @click="airdropClaimDialog = false">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="allocationDialog" width="500">
      <v-card>
        <v-card-title class="text-h5">
          Allocate Credits To Giveaway
        </v-card-title>

        <v-card-text>
          <div class="text-h6 text-center">Credits To Allocate</div>
          <v-btn-toggle v-model="selectedAllocationAmount" outlined class="d-block text-center mb-4" exclusive mandatory>
            <v-btn>
              100
            </v-btn>
            <v-btn>
              1000
            </v-btn>
            <v-btn>
              5000
            </v-btn>
            <v-btn>
              10000
            </v-btn>
          </v-btn-toggle>
          <v-autocomplete v-if="giveawayAllocationList.length" label="Giveaways" hide-details outlined
            :items="giveawayAllocationList" v-model="allocationGiveawayId" />
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="allocateCreditBalance">
            Allocate
          </v-btn>
          <v-btn color="grey" text @click="allocationDialog = false">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import GiveawayCard from "../components/GiveawayCard";
import store from "../store";
import { DateTime } from "luxon";
import ContentPage from "../components/ContentPage";

export default {
  components: { GiveawayCard, ContentPage },
  name: "Giveaways",
  data: () => ({
    newGiveawayDialog: false,
    userCollectionsDialog: false,
    otherCollectablesDialog: false,
    newContractAddress: "",
    newItemId: "",
    filterType: 0,
    filterTypes: [
      { value: 0, text: "All Giveaways" },
      { value: 1, text: "Upcoming Giveaways" },
      { value: 2, text: "Ongoing Giveaways" },
      { value: 3, text: "Past Giveaways" },
    ],
    sortType: 0,
    sortTypes: [
      { value: 0, text: "Name" },
      { value: 1, text: "Earliest Start Date" },
      { value: 2, text: "Latest Start Date" },
      { value: 3, text: "Earliest End Date" },
      { value: 4, text: "Latest End Date" },
    ],
    selectedClaimAmount: 1,
    selectedAllocationAmount: 1,
    selectedCollection: null,
    airdropClaimDialog: false,
    allocationDialog: false,
    allocationGiveawayId: null,
  }),
  beforeRouteEnter(to, from, next) {
    const isAuthenticated = store.getters["auth/authenticated"];
    if (!isAuthenticated) {
      next("/"); // Redirect to the login page if the user is not authenticated
    } else {
      store.dispatch("giveaway/getGiveaways");
      next(); // Continue rendering the component
    }
  },
  computed: {
    ...mapGetters({
      giveaways: "giveaway/giveawayList",
      loadingGiveaways: "giveaway/loadingGiveaways",
      loadingCollections: "collectables/loadingCollections",
      loadingCollectionItems: "collectables/loadingCollectionItems",
      userCollectionsCache: "collectables/userCollections",
      userItemsCache: "collectables/userItems",
      hasDeployedDCLScene: "scene/hasDeployedDCLScene",
      userAirdropCredits: "balances/userAirdropCredits",
      userPromoBalances: "balances/userPromoBalances",
      allocatedAirdropCredits: "giveaway/allocatedAirdropCredits"
    }),
    userUnclaimedGdaCredits() {
      if (!this.userPromoBalances || !this.userPromoBalances['great-dcl-airdrop']) return 0;
      return this.userPromoBalances['great-dcl-airdrop'];
    },
    airdropClaimAmount() {
      switch (this.selectedClaimAmount) {
        case 0:
          return 100;
        case 1:
          return 1000;
        case 2:
          return 5000;
        case 3:
          return 10000;
        default:
          return 100;
      }
    },
    airdropAllocationAmount() {
      switch (this.selectedAllocationAmount) {
        case 0:
          return 100;
        case 1:
          return 1000;
        case 2:
          return 5000;
        case 3:
          return 10000;
        default:
          return 100;
      }
    },
    userInfo() {
      return store.state.user.userInfo;
    },
    userOrgs() {
      return store.state.organization.userOrgs;
    },
    pastGiveaways() {
      return this.giveaways
        .filter(
          (giveaway) =>
            giveaway.endTime && DateTime.fromMillis(giveaway?.endTime).diffNow() < 0
        )
        .sort((a, b) => a.startTime > b.startTime);
    },
    ongoingGiveaways() {
      return [...this.giveaways]
        .sort((a, b) => {
          return a.startTime - b.startTime >= 0 ? a.startTime : b.startTime;
        })
        .filter(
          (giveaway) =>
            DateTime.fromMillis(giveaway.startTime).diffNow() < 0 &&
            (!giveaway.endTime ||
              DateTime.fromMillis(giveaway?.endTime).diffNow() > 0)
        );
    },
    giveawayAllocationList() {
      if (this.giveaways?.length) {
        return this.giveaways.map((giveaway) => {
          return {
            ...giveaway,
            text: giveaway.name,
            value: giveaway.sk,
          };
        })
      } else {
        return [];
      }
    },
    futureGiveaways() {
      return this.giveaways.filter(
        (giveaway) => DateTime.fromMillis(giveaway.startTime).diffNow() > 0
      );
    },
  },
  methods: {
    ...mapActions({
      getGiveaways: "giveaway/getGiveaways",
      createGiveaway: "giveaway/createGiveaway",
      getUserCollections: "collectables/getUserCollections",
      getUserCollectionItems: "collectables/getUserCollectionItems",
      allocateBalance: "balances/allocateBalance",
      claimPromoCredits: "balances/claimPromoCredits",
      showSuccess: "banner/showSuccess",
      showError: "banner/showError",
    }),
    collectionItems() {
      if (this.selectedCollection && !this.loadingCollectionItems && this.userItemsCache[this.selectedCollection]) {
        return this.userItemsCache[this.selectedCollection].map((item) => {
          return {
            ...item,
            text: item.name,
            value: item.itemId,
          };
        })
      } else {
        return [];
      }
    },
    userCollections() {
      return Object.values(this.userCollectionsCache).map((collection) => {
        return {
          ...collection,
          text: collection.name,
          value: collection.contractAddress,
        };
      })
    },
    async getCollectionItems() {
      await this.getUserCollectionItems(this.selectedCollection);
    },
    async showUserCollectionsDialog() {
      await this.getUserCollections();
      this.newGiveawayDialog = false;
      this.userCollectionsDialog = true;
    },
    showOtherCollectablesDialog() {
      this.newGiveawayDialog = false;
      this.otherCollectablesDialog = true;
    },
    openNewGiveawayDialog() {
      this.newGiveawayDialog = true;
    },
    createNewGiveaway() {
      this.newEventDialog = false;
      this.createGiveaway();
    },
    changeFilterType(filterType) {
      this.filterType = filterType
    },
    openClaimDialog() {
      this.airdropClaimDialog = true;
    },
    openAllocationDialog() {
      if (this.giveaways.length) {
        this.allocationDialog = true;
      } else {
        this.showError({ message: "You must create a giveaway before allocating credits." });
      }
    },
    claimAirdropCredits() {
      this.airdropClaimDialog = false;
      this.claimPromoCredits({ promoId: 'great-dcl-airdrop', amount: this.airdropClaimAmount });
    },
    allocateCreditBalance() {
      this.allocationDialog = false;
      this.allocateBalance({
        giveawayId: this.allocationGiveawayId,
        amount: this.airdropAllocationAmount,
        usePromoBalance: true
      });
    }
  },
};
</script>

<style scoped>
.giveaway-card-link {
  text-decoration: none;
}

.v-select__slot .v-select__selections input {
  display: none;
}

.frosted {
  background-color: rgba(75, 75, 125, 0.3);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.cyberpunk-border {
  border: 1px solid rgb(128, 0, 255);
}
</style>
