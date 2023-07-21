<template>
  <content-page
    loadingMessage="Loading your giveaways..."
    :loading="loading"
    :noContent="!filteredGiveaways.length"
  >
    <template v-slot:header>Giveaways</template>
    <template v-slot:header-actions>
      <v-menu offset-y :close-on-content-click="true">
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="primary" dark v-bind="attrs" v-on="on" class="mr-4">
            <v-icon class="mr-2">mdi-filter</v-icon
            >{{ filterTypes[filterType].text }}
          </v-btn>
        </template>

        <v-list>
          <v-list-item
            v-for="(filter, index) in filterTypes"
            :key="index"
            @click="changeFilterType(filter)"
          >
            <v-list-item-content>
              {{ filter.text }}
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu offset-y :close-on-content-click="true">
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="primary" dark v-bind="attrs" v-on="on" class="mr-4">
            <v-icon class="mr-2">mdi-account</v-icon>
            {{ giveawayOwners[activeOwner].text }}
          </v-btn>
        </template>

        
      </v-menu>
      <!-- <v-menu :close-on-content-click="true" v-model="sortTypes[0]">
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="primary" dark v-bind="attrs" v-on="on">
            <v-icon class="mr-2">mdi-sort</v-icon>{{ sortTypes[sortType].text }}
          </v-btn>
        </template>

        <v-list>
          <v-list-item
            v-for="(sort, index) in sortTypes"
            :key="index"
            v-model="sortType"
          >
            <v-list-item-title @click="changeSortType(sort.value)">{{
              sort.text
            }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu> -->
    </template>
    <template v-slot:no-content-header>No Giveaways Found</template>
    <template v-slot:no-content-text>
      Would you like to create a new giveaway?
    </template>
    <template v-slot:no-content-cta>
      <v-btn @click="createNewGiveaway">Create New Giveaway</v-btn>
    </template>
    <v-container fluid>
      <v-row class="text-center" v-if="!loading">
        <v-col
          md="4"
          sm="6"
          xs="12"
          v-for="(giveaway, i) in filteredGiveaways"
          :key="i"
        >
          <router-link :to="`giveaway/${giveaway.sk}`" class="giveaway-card-link">
            <giveaway-card :giveaway="giveaway" />
          </router-link>
        </v-col>
      </v-row>
    </v-container>
  </content-page>
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
    activeOwner: null,
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
    filteredGiveaways: [],
  }),
  mounted() {
    this.getGiveawayCards();
    this.filteredGiveaways = this.giveaways;
  },
  computed: {
    giveawayOwners() {
      return this.giveaways.map((giveaway) => ({
        creatorId: giveaway.creator,
        creatorDisplayName: giveaway.creatorDisplayName,
      }));
    },
    userInfo() {
      return store.state.user.userInfo;
    },
    userOrgs() {
      return store.state.organization.userOrgs;
    },
    ...mapGetters({
      giveaways: "giveaway/giveawayList",
    }),
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
    futureGiveaways() {
      return this.giveaways.filter(
        (giveaway) => DateTime.fromMillis(giveaway.startTime).diffNow() > 0
      );
    },
    memberSince() {
      return DateTime.fromSeconds(this.userInfo.registeredAt).toLocaleString();
    },
    loading() {
      return store.state.giveaway.processing;
    },
  },
  methods: {
    ...mapActions({
      getGiveawayCards: "giveaway/getGiveawayCards",
      createNewGiveaway: "giveaway/createNewGiveaway",
    }),
    changeFilterType(filterType) {
      this.filterType = filterType.value;
      switch (this.filterType) {
        case 0:
          this.filteredGiveaways = this.giveaways;
          break;
        case 1:
          this.filteredGiveaways = this.futureGiveaways;
          break;
        case 2:
          this.filteredGiveaways = this.ongoingGiveaways;
          break;
        case 3:
          this.filteredGiveaways = this.pastGiveaways;
          break;
      }
    },
  },
};
</script>

<style scoped>
.giveaway-card-link {
  text-decoration: none;
}
</style>
