<template>
  <content-page
    loadingMessage="Loading your events..."
    :loading="loading"
    :noContent="!filteredEvents.length"
  >
    <template v-slot:header>Events</template>
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
            {{ eventOwners[activeOwner].text }}
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
    <template v-slot:no-content-header>No Events Found</template>
    <template v-slot:no-content-text>
      Would you like to create a new event?
    </template>
    <template v-slot:no-content-cta>
      <v-btn @click="createNewEvent">Create New Event</v-btn>
    </template>
    <v-container fluid>
      <v-row class="text-center" v-if="!loading">
        <v-col
          md="4"
          sm="6"
          xs="12"
          v-for="(event, i) in filteredEvents"
          :key="i"
        >
          <router-link :to="`event/${event.sk}`" class="event-card-link">
            <event-card :event="event" />
          </router-link>
        </v-col>
      </v-row>
    </v-container>
  </content-page>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import EventCard from "../components/EventCard";
import store from "../store";
import { DateTime } from "luxon";
import ContentPage from "../components/ContentPage";

export default {
  components: { EventCard, ContentPage },
  name: "Events",
  data: () => ({
    activeOwner: null,
    filterType: 0,
    filterTypes: [
      { value: 0, text: "All Events" },
      { value: 1, text: "Upcoming Events" },
      { value: 2, text: "Ongoing Events" },
      { value: 3, text: "Past Events" },
    ],
    sortType: 0,
    sortTypes: [
      { value: 0, text: "Name" },
      { value: 1, text: "Earliest Start Date" },
      { value: 2, text: "Latest Start Date" },
      { value: 3, text: "Earliest End Date" },
      { value: 4, text: "Latest End Date" },
    ],
    filteredEvents: [],
  }),
  mounted() {
    this.getEventCards();
    this.filteredEvents = this.events;
  },
  computed: {
    eventOwners() {
      return this.events.map((event) => ({
        creatorId: event.creator,
        creatorDisplayName: event.creatorDisplayName,
      }));
    },
    userInfo() {
      return store.state.user.userInfo;
    },
    userOrgs() {
      return store.state.organization.userOrgs;
    },
    ...mapGetters({
      events: "event/eventList",
    }),
    pastEvents() {
      return this.events
        .filter(
          (event) =>
            event.endTime && DateTime.fromMillis(event?.endTime).diffNow() < 0
        )
        .sort((a, b) => a.startTime > b.startTime);
    },
    ongoingEvents() {
      return [...this.events]
        .sort((a, b) => {
          return a.startTime - b.startTime >= 0 ? a.startTime : b.startTime;
        })
        .filter(
          (event) =>
            DateTime.fromMillis(event.startTime).diffNow() < 0 &&
            (!event.endTime ||
              DateTime.fromMillis(event?.endTime).diffNow() > 0)
        );
    },
    futureEvents() {
      return this.events.filter(
        (event) => DateTime.fromMillis(event.startTime).diffNow() > 0
      );
    },
    memberSince() {
      return DateTime.fromSeconds(this.userInfo.registeredAt).toLocaleString();
    },
    loading() {
      return store.state.event.processing;
    },
  },
  methods: {
    ...mapActions({
      getEventCards: "event/getEventCards",
      createNewEvent: "event/createNewEvent",
    }),
    changeFilterType(filterType) {
      this.filterType = filterType.value;
      switch (this.filterType) {
        case 0:
          this.filteredEvents = this.events;
          break;
        case 1:
          this.filteredEvents = this.futureEvents;
          break;
        case 2:
          this.filteredEvents = this.ongoingEvents;
          break;
        case 3:
          this.filteredEvents = this.pastEvents;
          break;
      }
    },
  },
};
</script>

<style scoped>
.event-card-link {
  text-decoration: none;
}
</style>
