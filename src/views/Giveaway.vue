<template>
  <div>
    <v-dialog v-model="newItemDialog" width="380">
      <v-card>
        <v-card-title class="text-h5"> Add Giveaway Item </v-card-title>

        <v-card-text class="lighten-1">
          <v-card class="flex-grow-1 text-center pa-4 mb-2" @click="showUserCollectionsDialog">
            <v-icon>mdi-bag-personal</v-icon>
            <div class="text-button">My Collectables</div>
          </v-card>
          <v-card class="flex-grow-1 text-center pa-4 mt-2" @click="showOtherCollectablesDialog">
            <v-icon>mdi-storefront</v-icon>
            <div class="text-button">Other Collectables</div>
          </v-card>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="userCollectionsDialog" width="380">
      <v-card>
        <v-card-title class="text-h5"> My Collectables </v-card-title>
        <loader :message="'Loading collections...'" :loading="loadingCollections" :grid="true" />
        <v-card-text v-if="!loadingCollections">
          <v-autocomplete
            label="Collection"
            outlined
            :items="userCollections()"
            v-model="selectedCollection"
            @change="getCollectionItems"
            :loading="loadingCollections"
          >
          </v-autocomplete>
          <v-select
            v-if="selectedCollection"
            label="Item"
            outlined
            v-model="newItemId"
            :items="collectionItems()"
            :loading="loadingCollectionItems"
            :disabled="loadingCollectionItems"
          >
            <template v-slot:selection="data">
              <v-avatar class="mr-4">
                <v-img :src="data.item.thumbnail"></v-img>
              </v-avatar>
              <v-list-item-content v-html="data.item.name"> </v-list-item-content>
            </template>
            <template v-slot:item="data">
              <v-list-item-avatar>
                <img :src="data.item.thumbnail" />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title v-html="data.item.name"></v-list-item-title>
                <v-list-item-subtitle v-html="`${data.item.category.capitalize()} - ${data.item.rarity.capitalize()}`"></v-list-item-subtitle>
              </v-list-item-content>
            </template>
          </v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary darken-1" text @click="addGiveawayItem" :disabled="!selectedGiveawayItem?.contractAddress"> Add </v-btn>

          <v-btn color="grey darken-1" text @click="userCollectionsDialog = false"> Cancel </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="otherCollectablesDialog" width="380">
      <v-card>
        <v-card-title class="text-h6" > Item Details </v-card-title>
        <v-card-text>
          <v-text-field label="Collection Contract Address" outlined v-model="newContractAddress" @input="debounceImportCollection"></v-text-field>
          <div class="text-h6 align-center" v-if="newContractAddress && !loadingCollectionItems && selectedCollection && !collectionItems().length">Collection Not Found</div>
          <v-select
            v-else-if="newContractAddress && selectedCollection && collectionItems().length"
            label="Item"
            outlined
            v-model="newItemId"
            :items="collectionItems()"
            :loading="loadingCollectionItems"
            :disabled="loadingCollectionItems"
          >
            <template v-slot:item="data">
              <v-list-item-avatar>
                <img :src="data.item.thumbnail" />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title v-html="data.item.name"></v-list-item-title>
                <v-list-item-subtitle v-html="`${data.item.category.capitalize()} - ${data.item.rarity.capitalize()}`"></v-list-item-subtitle>
              </v-list-item-content>
            </template>
          </v-select>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="grey darken-1" text @click="otherCollectablesDialog = false"> Cancel </v-btn>

          <v-btn color="primary darken-1" text @click="addGiveawayItem" :loading="this.loadingItem" :disabled="!this.collectionItems().length">
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <focus-page :loadingMessage="`Loading ${giveaway?.name}`" :loading="loading" :noContent="!giveaway" :imageLink="placeholder">
      <template v-slot:header>{{ giveaway?.name }}</template>
      <template v-slot:header-actions></template>
      <template v-slot:no-content-header>Could Not Load Giveaway</template>
      <template v-slot:no-content-text> Please try again and contact support if the problem continues. </template>
      <v-card class="cyberpunk-border">
        <v-card-text class="d-flex align-center flex-grow-2">
          <div class="d-flex flex-column flex-grow-1 mr-4">
            <v-text-field label="Giveaway Title" v-model="giveaway.name" outlined hide-details class="mb-4" @change="updateProperties"></v-text-field>
            <v-textarea label="Giveaway Description" v-model="giveaway.description" outlined hide-details @change="updateProperties"></v-textarea>
          </div>
          <v-card class="pa-4 frosted mr-6 d-flex flex-column">
            <v-card-text class="flex-grow-1 d-flex flex-column justify-center align-center">
              <div class="text-h4">{{ giveaway.allocatedCredits }}</div>
              <div class="text-h6">Allocated Credits</div>
            </v-card-text>
            <v-card-text v-if="allocationDialog" class="flex-grow-1 d-flex flex-column justify-center align-center">
              <v-btn-toggle v-model="selectedAllocationAmount" outlined class="d-block text-center mb-4" exclusive mandatory>
                <v-btn> 100 </v-btn>
                <v-btn> 1000 </v-btn>
                <v-btn> 5000 </v-btn>
                <v-btn> 10000 </v-btn>
              </v-btn-toggle>
            </v-card-text>
            <v-card-actions v-if="!allocationDialog">
              <v-btn color="primary" @click="openAllocationDialog">Allocate Credits</v-btn>
              <v-btn color="primary" @click="openBuyCreditsDialog" disabled>Buy More Credits</v-btn>
            </v-card-actions>
            <v-card-actions v-if="allocationDialog">
              <v-btn color="primary" @click="allocateCreditBalance">Add</v-btn>
              <v-btn color="grey darken-1" @click="allocationDialog = false">Cancel</v-btn>
            </v-card-actions>
          </v-card>
          <v-card class="pa-4 frosted mr-6 d-flex flex-column">
            <v-card-text class="flex-grow-1 d-flex flex-column justify-center align-center" v-if="!eventLinkMenu">
              <div class="text-h4">{{ linkedEvents(giveaway.sk).length }}</div>
              <div class="text-h6">Linked Event{{ linkedEvents(giveaway.sk).length !== 1 ? 's' : '' }}</div>
            </v-card-text>
            <v-card-text class="flex-grow-1 d-flex flex-column justify-center align-center" v-if="eventLinkMenu">
              <v-select label="Event" outlined v-model="selectedEvent" :items="events" :loading="updatingLink">
                <template v-slot:selection="data">
                  <v-list-item-content v-html="data.item.name"> </v-list-item-content>
                </template>
                <template v-slot:item="data">
                  <v-list-item-content>
                    <v-list-item-title v-html="data.item.name"></v-list-item-title>
                    <v-list-item-subtitle v-html="`${getDateTime(data.item.eventStart)} - ${getDateTime(data.item.eventEnd)}`"></v-list-item-subtitle>
                  </v-list-item-content>
                </template>
              </v-select>
            </v-card-text>
            <v-card-actions class="d-flex justify-center" v-if="!eventLinkMenu">
              <v-btn color="primary" @click="eventLinkMenu = true">Edit</v-btn>
            </v-card-actions>
            <v-card-actions class="d-flex justify-center" v-if="eventLinkMenu">
              <v-btn color="primary" @click="linkEvent" v-if="!linkedEvent" :loading="updatingLink">Link</v-btn>
              <v-btn color="error" @click="unlinkEvent" v-if="linkedEvent" :loading="updatingLink">Unlink</v-btn>
              <v-btn color="grey darken-1" @click="eventLinkMenu = false">Cancel</v-btn>
            </v-card-actions>
          </v-card>
        </v-card-text>
      </v-card>

      <v-card class="cyberpunk-border pa-4 mt-4">
        <v-card-title class="d-flex justify-space-between">
          <div>Giveaway Items</div>
          <v-btn @click="openItemDialog" :loading="loadingCollections" :disabled="userCollectionsDialog || loadingCollections">Add Item</v-btn>
        </v-card-title>
        <v-card-text v-if="!items.length">
          <div class="text-h6 text-center">No Items Added</div>
          <div class="text-display text-center">Add a giveaway item to get started</div>
        </v-card-text>
        <v-card-text v-else>
          <v-container>
            <v-row class="d-flex justify-start">
              <div v-for="(item, i) in items" :key="i">
                <v-col xs="12" sm="6" md="6" lg="4" v-if="item?.contractAddress" class="d-flex justify-start align-start">
                  <giveaway-item-card :item="item" :key="i" @removeGiveawayItem="removeGiveawayItem"></giveaway-item-card>
                </v-col>
              </div>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </focus-page>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { DateTime } from 'luxon'
import imgPlaceholder from '@/assets/placeholder.png'
import FocusPage from '../components/FocusPage'
import Loader from '../components/Loader'
import GiveawayItemCard from '../components/GiveawayItemCard'
import { debounce } from 'lodash'

export default {
  name: 'Giveaway',
  components: {
    FocusPage,
    Loader,
    GiveawayItemCard,
  },
  data: () => ({
    newItemDialog: false,
    userCollectionsDialog: false,
    otherCollectablesDialog: false,
    allocationDialog: false,
    selectedCollection: null,
    newContractAddress: '',
    newItemId: '',
    loadingItem: false,
    importedCollection: null,
    selectedAllocationAmount: 1,
    eventLinkMenu: false,
    updatingLink: false,
    selectedEvent: null,
  }),

  mounted() {
    this.setActiveGiveaway(this.$route.params.giveawayId)
    this.getGiveaway(this.$route.params.giveawayId)
  },
  beforeUpdate() {},
  beforeDestroy() {
    this.clearActiveGiveaway()
  },
  computed: {
    ...mapGetters({
      user: 'user/userInfo',
      activeGiveaway: 'giveaway/activeGiveaway',
      giveaways: 'giveaway/giveawayList',
      loading: 'giveaway/loadingGiveaways',
      loadingCollections: 'collectables/loadingCollections',
      loadingCollectionItems: 'collectables/loadingCollectionItems',
      userCollectionsCache: 'collectables/userCollections',
      userItemsCache: 'collectables/userItems',
      linkedEvents: 'event/eventsForGiveaway',
      giveawaysForEvent: 'event/giveawaysForEvent',
      events: 'event/eventList',
    }),
    giveaway() {
      return this.activeGiveaway || {}
    },
    items() {
      return this.giveaway.items || []
    },
    linkedEvent() {
      if (!this.selectedEvent) return false
      return !!this.linkedEvents(this.giveaway?.sk).find((event) => event.sk === this.selectedEvent?.sk)
    },
    placeholder() {
      return imgPlaceholder
    },
    selectedGiveawayItem() {
      if (!this.userItemsCache[this.selectedCollection]) {
        return {}
      }
      return this.userItemsCache[this.selectedCollection].find((item) => item.itemId == this.newItemId)
    },
    airdropAllocationAmount() {
      switch (this.selectedAllocationAmount) {
        case 0:
          return 100
        case 1:
          return 1000
        case 2:
          return 5000
        case 3:
          return 10000
        default:
          return 100
      }
    },
  },
  methods: {
    ...mapActions({
      setActiveGiveaway: 'giveaway/setActiveGiveaway',
      clearActiveGiveaway: 'giveaway/clearActiveGiveaway',
      getGiveaway: 'giveaway/getGiveaway',
      sendUiMessage: 'moderation/sendUiMessage',
      createGiveaway: 'giveaway/createGiveaway',
      updateGiveaway: 'giveaway/updateGiveaway',
      addItemToGiveaway: 'giveaway/addItemToGiveaway',
      getUserCollections: 'collectables/getUserCollections',
      getUserCollectionItems: 'collectables/getUserCollectionItems',
      updateGiveawayLinks: 'event/updateGiveawayLinks',
      unlinkGiveaway: 'event/unlinkGiveaway',
    }),
    collectionItems() {
      if (this.selectedCollection && !this.loadingCollectionItems && this.userItemsCache[this.selectedCollection]) {
        return this.userItemsCache[this.selectedCollection].map((item) => {
          return {
            ...item,
            text: item.name,
            value: item.itemId,
          }
        })
      } else {
        return []
      }
    },
    userCollections() {
      return Object.values(this.userCollectionsCache).map((collection) => {
        return {
          ...collection,
          text: collection.name,
          value: collection.contractAddress,
        }
      })
    },
    debounceImportCollection: debounce(function () {
      this.importCollection()
    }, 1000),
    async importCollection() {
      this.selectedCollection = this.newContractAddress
      return await this.getUserCollectionItems(this.selectedCollection)
    },
    async getCollectionItems() {
      this.newItemId = null
      return await this.getUserCollectionItems(this.selectedCollection)
    },
    async showUserCollectionsDialog() {
      this.selectedCollection = null
      await this.getUserCollections()
      this.newItemDialog = false
      this.userCollectionsDialog = true
    },
    showOtherCollectablesDialog() {
      this.newItemDialog = false
      this.otherCollectablesDialog = true
    },
    openItemDialog() {
      this.newItemDialog = true
      // this.showUserCollectionsDialog()
    },
    openBuyCreditsDialog() {
      this.buyCreditsDialog = true
    },
    openAllocationDialog() {
      if (this.giveaways.length) {
        this.allocationDialog = true
      } else {
        this.showError({ message: 'You must create a giveaway before allocating credits.' })
      }
    },
    async linkEvent() {
      this.updatingLink = true
      const giveawayLinkIds = this.giveawaysForEvent(this.selectedEvent.sk).map((giveaway) => giveaway.sk)
      giveawayLinkIds.push(this.giveaway.sk)
      await this.updateGiveawayLinks({ eventId: this.selectedEvent?.sk, giveawayLinkIds })
      this.updatingLink = false
      this.eventLinkMenu = false
    },
    async unlinkEvent() {
      this.updatingLink = true
      await this.unlinkGiveaway({ eventId: this.selectedEvent?.sk, giveawayId: this.giveaway.sk })
      this.updatingLink = false
      this.eventLinkMenu = false
    },
    addGiveawayItem() {
      this.newItemDialog = false
      this.userCollectionsDialog = false
      this.otherCollectablesDialog = false
      this.addItemToGiveaway({
        giveawayId: this.giveaway.sk,
        item: {
          name: this.selectedGiveawayItem.name,
          chain: this.selectedGiveawayItem.chainId,
          imageSrc: this.selectedGiveawayItem.thumbnail,
          category: this.selectedGiveawayItem.category,
          rarity: this.selectedGiveawayItem.rarity,
          contractAddress: this.selectedCollection,
          itemId: this.newItemId,
        },
      })
    },
    allocateCreditBalance() {
      this.allocationDialog = false
      this.allocateBalance({
        giveawayId: this.giveaway.sk,
        amount: this.airdropAllocationAmount,
        usePromoBalance: true,
      })
    },
    changeFilterType(filterType) {
      this.filterType = filterType
    },
    updateProperties() {
      this.updateGiveaway(this.giveaway)
    },
    goBack() {
      this.$router.go(-1)
    },
    getDateTime(timestamp) {
      return DateTime.fromMillis(timestamp).toLocaleString(DateTime.DATETIME_SHORT)
    },
    removeGiveawayItem(item) {
      this.giveaway.items = this.giveaway.items.filter((giveawayItem) => {
        return giveawayItem.contractAddress !== item.contractAddress || giveawayItem.itemId !== item.itemId
      })
      this.updateProperties()
    },
  },
}
</script>

<style scoped>
.date-text {
  line-height: 14pt;
}

.visible {
  opacity: 1;
}

.hidden {
  opacity: 0;
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
