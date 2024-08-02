<template>
  <div>
    <!-- DIALOGS -->
    <v-dialog v-model="newItemDialog" width="380">
      <v-card>
        <v-card-title class="text-h5"> Add Giveaway Item </v-card-title>

        <v-card-text class="lighten-1">
          <v-card class="flex-grow-1 text-center pa-4 mb-2" @click="openUserCollectionsDialog">
            <v-icon>mdi-bag-personal</v-icon>
            <div class="text-button">My Collectables</div>
          </v-card>
          <v-card class="flex-grow-1 text-center pa-4 mt-2" @click="openOtherCollectablesDialog">
            <v-icon>mdi-storefront</v-icon>
            <div class="text-button">Other Collectables</div>
          </v-card>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="mintingRightsDialog" width="380">
      <v-card>
        <v-card-title class="text-h5"> Manage Minting Rights </v-card-title>
        <v-card v-if="!allItemsHaveMinterRights" class="flex-grow-1 text-center pa-4 mt-2" @click="openGrantRightsDialog">
          <v-icon>mdi-key-change</v-icon>
          <div class="text-button">Grant Rights</div>
        </v-card>
        <v-card v-if="itemsWithMinterRights?.length > 0" class="flex-grow-1 text-center pa-4 mt-2" @click="openRevokeRightsDialog">
          <v-icon>mdi-key-remove</v-icon>
          <div class="text-button">Revoke Rights</div>
        </v-card>
      </v-card>
    </v-dialog>

    <v-dialog v-model="mintingRightsGrantDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5"> Grant Minting Rights </v-card-title>
        <v-card class="d-flex align-start info pa-2 mx-4">
          <v-icon large class="mr-1 mb-1">mdi-information</v-icon>There are two different ways to grant minting rights to Virtual Land Manager. Please
          select your perferred method after analyzing the pros and cons of each approach.
        </v-card>
        <v-card class="d-flex pa-4 ma-4 grey darken-2">
          <!-- Left Column-->
          <div class="d-flex flex-column justify-space-between align-center flex-grow-1">
            <div class="d-flex flex-column justify-start">
              <div class="text-button">Sign By Collection</div>
              <div class="text-caption">Grants VLM the right to mint each item in every collection you've added</div>
            </div>
            <div class="d-flex justify-flex-start">
              <div class="d-flex flex-column justify-flex-start">
                <v-list class="transparent">
                  <v-list-item><v-icon small class="mr-2">mdi-speedometer</v-icon>Quicker, fewer signatures</v-list-item>
                  <v-list-item><v-icon small class="mr-2">mdi-format-list-checkbox</v-icon>May provide more rights than needed</v-list-item>
                </v-list>
              </div>
            </div>
          </div>
          <!-- Right Column-->
          <div class="d-flex align-center ml-2">
            <v-btn color="blue" @click="grantMintingRightsByCollection"><v-icon class="mr-2">mdi-tag-multiple</v-icon> Sign </v-btn>
          </div>
        </v-card>
        <v-card class="d-flex pa-4 ma-4 grey darken-2">
          <!-- Left Column-->
          <div class="d-flex flex-column justify-space-between align-start flex-grow-1">
            <div class="d-flex flex-column justify-start">
              <div class="text-button">Sign By Item</div>
              <div class="text-caption">Grants VLM the right to mint only the items you've added</div>
            </div>
            <div class="d-flex justify-flex-start">
              <v-list class="transparent">
                <v-list-item><v-icon small class="mr-2">mdi-speedometer-slow</v-icon>Slower, more signatures</v-list-item>
                <v-list-item><v-icon small class="mr-2">mdi-format-list-checks</v-icon>More customized access</v-list-item>
              </v-list>
            </div>
          </div>
          <!-- Right Column-->
          <div class="d-flex align-center ml-2">
            <v-btn color="blue" @click="grantMintingRightsByItem"><v-icon class="mr-2">mdi-tag</v-icon> Sign </v-btn>
          </div>
        </v-card>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="mintingRightsGrantDialog = false"> Cancel </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="mintingRightsRevokeDialog" width="380">
      <v-card>
        <v-card-title class="text-h5"> Revoke Minting Rights </v-card-title>
        <v-card-text
          >Are you sure you want to revoke minting rights? This will prevent your giveaway from working and should only be done as a precaution after
          your giveaway event is over.</v-card-text
        >
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="revokeMintingRights"> Revoke </v-btn>
          <v-btn color="primary" @click="mintingRightsRevokeDialog = false"> Cancel </v-btn>
        </v-card-actions>
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
          <v-btn color="primary darken-1" text @click="addGiveawayItem" :loading="this.loadingItem" :disabled="!this.collectionItems().length">
            Add
          </v-btn>

          <v-btn color="grey darken-1" text @click="userCollectionsDialog = false"> Cancel </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="allocationDialog" width="380">
      <v-card class="pa-6 d-flex flex-column">
        <v-card-text class="flex-grow-1 d-flex flex-column justify-center align-center">
          <div class="text-h4">{{ userAirdropCredits }}</div>
          <div class="text-h6">Available Credits</div>
          <div class="text-display">—</div>
          <div class="text-h4">{{ giveaway.allocatedCredits }}</div>
          <div class="text-h6">Allocated Credits</div>
        </v-card-text>
        <v-card-text class="flex-grow-1 d-flex flex-column justify-center align-center">
          <div class="text-caption">CREDITS TO MOVE</div>
          <v-btn-toggle v-model="selectedAllocationAmount" outlined class="d-block text-center" exclusive mandatory>
            <v-btn> 100 </v-btn>
            <v-btn> 1000 </v-btn>
            <v-btn> 5000 </v-btn>
            <v-btn> 10000 </v-btn>
          </v-btn-toggle>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn color="primary" @click="allocateCreditBalance">Add</v-btn>
          <v-btn color="blue" @click="deallocateCreditBalance">Deduct</v-btn>
          <v-btn color="grey darken-1" @click="allocationDialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="linkedEventDialog" width="380">
      <v-card class="pa-4 d-flex flex-column">
        <v-card-title class="text-h5">{{ linkedEvents.length }} Linked Event{{ linkedEvents.length !== 1 ? 's' : '' }} </v-card-title>
        <v-card-text class="d-flex flex-column justify-center align-center">
          <v-list class="d-flex flex-column flex-grow-1 indigo lighten-1 pa-1 elevation-6" v-if="linkedEvents.length">
            <v-list-item v-for="event of linkedEvents" :key="event.sk" class="d-flex ma-1 indigo justify-space-between elevation-2">
              <span class="text-h6 flex-grow-1">{{ event.name }}</span>
              <v-btn small icon class="flex-grow-0"><v-icon small @click="unlinkEvent(event.sk)">mdi-close</v-icon></v-btn>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-text class="d-flex flex-column justify-center align-center">
          <div class="d-flex justify-space-between align-center">
            <v-autocomplete label="Event" outlined v-model="userEventSelection" :items="unlinkedEvents" item-text="name" item-value="sk" hide-details>
            </v-autocomplete>
            <v-btn color="primary" @click="linkEvent(userEventSelection)" class="ml-4">Add</v-btn>
          </div>
        </v-card-text>
        <v-card-actions class="d-flex justify-center">
          <v-btn color="primary" @click="updateLinkedEvents">Save</v-btn>
          <v-btn @click="cancelEventLinks">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="otherCollectablesDialog" width="380">
      <v-card>
        <v-card-title class="text-h6"> Item Details </v-card-title>
        <v-card-text>
          <v-text-field label="Collection Contract Address" outlined v-model="newContractAddress" @input="debounceImportCollection"></v-text-field>
          <div class="text-h6 align-center" v-if="newContractAddress && !loadingCollectionItems && selectedCollection && !collectionItems().length">
            Collection Not Found
          </div>
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

    <!-- MAIN CONTENT -->
    <focus-page :loadingMessage="`Loading ${giveaway?.name}`" :loading="loading" :noContent="!giveaway" :imageLink="placeholder">
      <template v-slot:header>{{ giveaway?.name }}</template>
      <template v-slot:header-actions></template>
      <template v-slot:no-content-header>Could Not Load Giveaway</template>
      <template v-slot:no-content-text> Please try again and contact support if the problem continues. </template>
      <!-- Header Bar -->
      <v-card class="cyberpunk-border">
        <v-card-text class="d-flex align-start">
          <div class="d-flex flex-column justify-start flex-grow-1">
            <v-text-field label="Giveaway Title" v-model="giveaway.name" outlined hide-details class="mb-4" @change="updateProperties"></v-text-field>
            <v-textarea label="Giveaway Description" v-model="giveaway.description" outlined hide-details @change="updateProperties"></v-textarea>
          </div>
          <div class="d-flex flex-column justify-start align-center pb-4 flex-grow-1">
            <div class="text-h6 mb-2">{{ linkedEvents.length }} Linked Event{{ linkedEvents.length !== 1 ? `s` : '' }}</div>
            <v-btn :loading="updatingLink" v-if="linkedEvents.length" text @click="openLinkedEventDialog">MANAGE LINKED EVENTS</v-btn>
            <v-btn :loading="updatingLink" v-else color="error" text @click="openLinkedEventDialog">LINK AN EVENT</v-btn>

            <div class="text-h6 my-2">{{ giveaway.allocatedCredits }} Allocated Credits</div>
            <v-btn v-if="giveaway.allocatedCredits" text @click="openAllocationDialog">MANAGE CREDITS</v-btn>
            <v-btn v-else-if="userAirdropCredits" text color="error" @click="openAllocationDialog">ADD CREDITS</v-btn>
            <v-btn v-else color="error" text @click="openAllocationDialog">OBTAIN CREDITS</v-btn>

            <div class="text-h6 mt-2 align-center" v-if="allItemsHaveMinterRights">
              Minting Rights: <span class="text-body green--text">GRANTED</span><v-icon color="green" class="ml-1">mdi-check-circle</v-icon>
            </div>
            <div class="text-h6 mt-2 align-center" v-if="!allItemsHaveMinterRights">
              Minting Rights: <span class="text-body yellow--text">UNAUTHORIZED</span><v-icon color="yellow" class="ml-1">mdi-alert-circle</v-icon>
            </div>
            <v-btn text v-if="!allItemsHaveMinterRights" @click="openMintingRightsDialog" color="error">Allow Minting</v-btn>
            <v-btn text v-else @click="openMintingRightsDialog">Manage Minting Rights</v-btn>
          </div>
        </v-card-text>
      </v-card>

      <!-- Giveaway Status -->
      <v-card class="cyberpunk-border mt-4">
        <div class="d-flex flex-column justify-center flex-grow-1">
          <v-expansion-panels accordion>
            <v-expansion-panel>
              <v-expansion-panel-header>
                <div class="text-h6 d-flex align-space-between justify-space-between">
                  <span>Giveaway Status</span>
                  <span v-if="setupComplete && !giveaway.claimCount" class="text-body green--text mx-2"
                    >SETUP COMPLETE<v-icon class="green--text mx-2 mb-1" medium>mdi-check-circle</v-icon></span
                  >
                  <span v-else-if="setupComplete && giveaway.claimCount" class="text-body green--text mx-2"
                    >SETUP COMPLETE - GIVEAWAY ACTIVE<v-icon class="green--text mx-2 mb-1" medium>mdi-check-circle</v-icon></span
                  >
                  <span v-else class="text-body yellow--text mx-2"
                    >ACTION NEEDED<v-icon class="yellow--text mx-2 mb-1" medium>mdi-alert-circle</v-icon></span
                  >
                </div>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-list subheader two-line>
                  <v-list-item>
                    <v-list-item-avatar>
                      <v-icon class="lighten-1" :class="`${giveaway?.items?.length && 'green'}`" dark> mdi-gift </v-icon>
                    </v-list-item-avatar>

                    <v-list-item-content>
                      <v-list-item-title v-text="'Add Items'"></v-list-item-title>

                      <v-list-item-subtitle v-text="`${giveaway?.items?.length || 'No'} items added`"></v-list-item-subtitle>
                    </v-list-item-content>

                    <v-list-item-action class="d-flex flex-row align-center">
                      <v-btn icon>
                        <v-icon v-if="!giveaway?.items?.length" class="yellow--text">mdi-alert-circle</v-icon>
                        <v-icon v-else class="green--text">mdi-check-circle</v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>
                  <v-list-item :class="giveaway?.items?.length ? '' : 'disabled'">
                    <v-list-item-avatar>
                      <v-icon class="lighten-1" :class="`${linkedEvents.length ? 'green' : 'grey'}`" dark> mdi-calendar </v-icon>
                    </v-list-item-avatar>

                    <v-list-item-content>
                      <v-list-item-title v-text="'Link an Event'"></v-list-item-title>

                      <v-list-item-subtitle v-text="`${linkedEvents.length || 'No'} linked events`"></v-list-item-subtitle>
                    </v-list-item-content>

                    <v-list-item-action class="d-flex flex-row align-center">
                      <v-btn icon>
                        <v-icon v-if="!giveaway?.items?.length" class="grey--text">mdi-minus-circle</v-icon>
                        <v-icon v-else-if="linkedEvents.length > 0" class="green--text">mdi-check-circle</v-icon>
                        <v-icon v-else class="yellow--text">mdi-alert-circle</v-icon>
                      </v-btn>
                    </v-list-item-action> </v-list-item
                  ><v-list-item>
                    <v-list-item-avatar>
                      <v-icon class="lighten-1" :class="`${giveaway.allocatedCredits > 0 ? 'green' : 'grey'}`" dark> mdi-wallet-outline </v-icon>
                    </v-list-item-avatar>

                    <v-list-item-content>
                      <v-list-item-title v-text="'Allocate Airdrop Credits'"></v-list-item-title>

                      <v-list-item-subtitle v-text="`${giveaway.allocatedCredits || 'No'} allocated credits remaining`"></v-list-item-subtitle>
                    </v-list-item-content>

                    <v-list-item-action class="d-flex flex-row align-center">
                      <v-btn icon>
                        <v-icon v-if="!giveaway?.items?.length" class="grey--text">mdi-minus-circle</v-icon>
                        <v-icon v-else-if="giveaway?.allocatedCredits > 0" class="green--text">mdi-check-circle</v-icon>
                        <v-icon v-else class="yellow--text">mdi-alert-circle</v-icon>
                      </v-btn>
                    </v-list-item-action> </v-list-item
                  ><v-list-item :class="giveaway?.items?.length ? '' : 'disabled'">
                    <v-list-item-avatar>
                      <v-icon class="lighten-1" :class="`${allItemsHaveMinterRights ? 'green' : 'grey'}`" dark> mdi-key </v-icon>
                    </v-list-item-avatar>

                    <v-list-item-content>
                      <v-list-item-title v-text="'Allow Minting'"></v-list-item-title>

                      <v-list-item-subtitle>
                        {{
                          `${
                            allItemsHaveMinterRights ? 'All' : `${itemsWithMinterRights?.length} of ${giveaway?.items?.length}`
                          } items have minting rights`
                        }}
                      </v-list-item-subtitle>
                    </v-list-item-content>

                    <v-list-item-action class="d-flex flex-row align-center">
                      <v-btn v-if="!allItemsHaveMinterRights" small @click="openMintingRightsDialog" class="mr-2">Allow Minting</v-btn>
                      <v-menu v-if="itemsWithMinterRights?.length > 0" bottom left>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn dark icon v-bind="attrs" v-on="on" small class="mr-2">
                            <v-icon x-small class="grey--text darken-1--text">mdi-shield</v-icon>
                          </v-btn>
                        </template>
                        <v-list>
                          <v-list-item @click="openMintingRightsDialog">
                            <v-list-item-title>Revoke Minting Rights</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                      <v-icon v-if="!giveaway?.items?.length" class="grey--text">mdi-minus-circle</v-icon>
                      <v-icon v-else-if="allItemsHaveMinterRights" class="green--text">mdi-check-circle</v-icon>
                      <v-icon v-else class="yellow--text">mdi-alert-circle</v-icon>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </v-card>

      <!-- Giveaway Items -->
      <v-card class="cyberpunk-border pa-4 mt-4">
        <v-card-title class="d-flex justify-space-between">
          <div>Giveaway Items</div>
          <v-btn @click="openItemDialog" :loading="loadingCollections" :disabled="userCollectionsDialog || loadingCollections">Add Item</v-btn>
        </v-card-title>
        <v-card-text v-if="!items?.length">
          <div class="text-h6 text-center">No Items Added</div>
          <div class="text-display text-center">Add a giveaway item to get started</div>
        </v-card-text>
        <v-card-text v-else>
          <v-container>
            <v-row class="d-flex justify-start">
              <div v-for="(item, i) in items" :key="i">
                <v-col v-if="item?.contractAddress" class="d-flex justify-start align-start">
                  <giveaway-item-card :item="item" :key="i" @removeGiveawayItem="removeGiveawayItem"></giveaway-item-card>
                </v-col>
              </div>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </focus-page>
    <!-- END MAIN CONTENT -->
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
    mintingRightsDialog: false,
    mintingRightsGrantDialog: false,
    mintingRightsRevokeDialog: false,
    newItemDialog: false,
    userCollectionsDialog: false,
    otherCollectablesDialog: false,
    linkedEventDialog: false,
    allocationDialog: false,
    selectedCollection: null,
    newContractAddress: '',
    newItemId: '',
    loadingItem: false,
    importedCollection: null,
    selectedAllocationAmount: 1,
    eventLinkMenu: false,
    updatingLink: false,
    eventLinkIds: [],
    userEventSelection: '',
  }),

  mounted() {
    this.setActiveGiveaway(this.$route.params.giveawayId)
    this.getGiveaway(this.$route.params.giveawayId)
    this.eventLinkIds = this.eventsForGiveaway(this.$route.params.giveawayId).map((event) => event.sk)
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
      eventsForGiveaway: 'event/eventsForGiveaway',
      events: 'event/eventList',
      grantedMinterRights: 'giveaway/grantedMinterRights',
      userAirdropCredits: 'balances/userAirdropCredits',
    }),
    linkedEvents() {
      return this.events.filter((event) => this.eventLinkIds.includes(event.sk))
    },
    unlinkedEvents() {
      return this.events.filter((event) => !this.eventLinkIds.includes(event.sk))
    },
    giveaway() {
      return this.activeGiveaway || {}
    },
    giveawayId() {
      return this.giveaway.sk
    },
    items() {
      return this.giveaway.items
    },
    placeholder() {
      return imgPlaceholder
    },
    hasMinterRights() {
      return this.giveaway.items?.every((item) => this.grantedMinterRights.includes(`${item.contractAddress}:${item.itemId}`))
    },
    itemsWithMinterRights() {
      return this.giveaway?.items?.filter((item) => this.grantedMinterRights.includes(`${item.contractAddress}:${item.itemId}`))
    },
    allItemsHaveMinterRights() {
      return this.giveaway.items?.length == this.itemsWithMinterRights?.length
    },
    selectedGiveawayItem() {
      return this.userItemsCache[this.selectedCollection]
        ? this.userItemsCache[this.selectedCollection]?.find((item) => item.itemId == this.newItemId)
        : null
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
    setupComplete() {
      return this.giveaway?.items?.length > 0 && this.giveaway.allocatedCredits > 0 && this.linkedEvents.length > 0 && this.allItemsHaveMinterRights
    },
  },
  methods: {
    ...mapActions({
      setActiveGiveaway: 'giveaway/setActiveGiveaway',
      clearActiveGiveaway: 'giveaway/clearActiveGiveaway',
      getGiveaway: 'giveaway/getGiveaway',
      allocateBalance: 'balances/allocateBalance',
      deallocateBalance: 'balances/deallocateBalance',
      sendUiMessage: 'moderation/sendUiMessage',
      createGiveaway: 'giveaway/createGiveaway',
      updateGiveaway: 'giveaway/updateGiveaway',
      addItemToGiveaway: 'giveaway/addItemToGiveaway',
      getUserCollections: 'collectables/getUserCollections',
      getUserCollectionItems: 'collectables/getUserCollectionItems',
      updateGiveawayLinks: 'event/updateGiveawayLinks',
      updateEventLinks: 'event/updateEventLinks',
      requestMintingRights: 'giveaway/requestMintingRights',
    }),
    grantMintingRightsByCollection() {
      return this.requestMintingRights({ giveawayId: this.giveaway.sk })
    },
    grantMintingRightsByItem() {
      return this.requestMintingRights({ giveawayId: this.giveaway.sk, byItem: true })
    },
    revokeMintingRights() {
      this.mintingRightsRevokeDialog = false
      this.requestMintingRights({ giveawayId: this.giveaway.sk, revoke: true })
    },
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
    updateLinkedEvents() {
      this.linkedEventDialog = false
      this.eventLinksUpdate()
    },
    cancelEventLinks() {
      this.linkedEventDialog = false
      this.eventLinkIds = this.eventsForGiveaway(this.giveaway?.sk).map((event) => event.sk)
    },
    linkEvent() {
      this.eventLinkIds.push(this.userEventSelection)
      console.log(this.eventLinkIds)
      this.userEventSelection = ''
    },
    unlinkEvent(eventId) {
      this.eventLinkIds = this.eventLinkIds.filter((id) => id !== eventId)
    },
    debounceImportCollection: debounce(function () {
      this.importCollection()
    }, 1000),
    async importCollection() {
      this.selectedCollection = this.newContractAddress
      await this.getUserCollectionItems(this.selectedCollection)
      this.newItemId = null
    },
    async getCollectionItems() {
      await this.getUserCollectionItems(this.selectedCollection)
      this.newItemId = null
    },
    async openUserCollectionsDialog() {
      this.selectedCollection = null
      await this.getUserCollections()
      this.newItemDialog = false
      this.userCollectionsDialog = true
    },
    openOtherCollectablesDialog() {
      this.newItemDialog = false
      this.otherCollectablesDialog = true
    },
    openGrantRightsDialog() {
      this.mintingRightsGrantDialog = true
      this.mintingRightsDialog = false
    },
    openRevokeRightsDialog() {
      this.mintingRightsRevokeDialog = true
      this.mintingRightsDialog = false
    },
    openMintingRightsDialog() {
      this.mintingRightsDialog = true
    },
    openLinkedEventDialog() {
      this.linkedEventDialog = true
    },
    openItemDialog() {
      this.newItemDialog = true
      // this.openUserCollectionsDialog()
    },
    openBuyCreditsDialog() {
      this.buyCreditsDialog = true
    },
    openAllocationDialog() {
      this.allocationDialog = true
    },
    async eventLinksUpdate() {
      this.updatingLink = true
      await this.updateEventLinks({ giveawayId: this.giveaway?.sk, eventLinkIds: this.eventLinkIds })
      this.updatingLink = false
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
    deallocateCreditBalance() {
      this.allocationDialog = false
      this.deallocateBalance({
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
    getRelativeTimeString(startTs, endTs) {
      console.log('INPUT: ', startTs, endTs)
      if (endTs && DateTime.now() > endTs) {
        return `Ended ${DateTime.fromMillis(endTs).toRelative()}`
      } else if (startTs && DateTime.now() > DateTime.fromMillis(startTs)) {
        return `Started ${DateTime.fromMillis(startTs).toRelative()}`
      } else if (startTs && DateTime.now() < DateTime.fromMillis(startTs)) {
        return `Starts ${DateTime.fromMillis(startTs).toRelative()}`
      } else {
        return 'Date & Time Not Configured'
      }
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
