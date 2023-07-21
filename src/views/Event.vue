<template>
  <focus-page :loadingMessage="`Loading ${event?.name}`" :loading="loading" :noContent="!event" :imageLink="event?.imageLink || placeholder">
    <template v-slot:header>{{ event?.name }}</template>
    <template v-slot:header-actions
      ><v-chip v-if="ongoing" class="green ma-4"><span>Ongoing</span></v-chip>
      <v-chip v-else-if="future" class="orange ma-4"
        ><span>Starts {{ startTimeString }}</span></v-chip
      >
      <v-chip v-else class="grey ma-4"
        ><span>Ended {{ endTimeString }}</span></v-chip
      ></template
    >
    <template v-slot:no-content-header>Could Not Load Event</template>
    <template v-slot:no-content-text> Please try again and contact support if the problem continues. </template>
    <div class="">
      <v-card class="cyberpunk-border mx-4 my-2">
        <v-card-text>
          <v-container>
            <v-row>
              <v-col md="2" sm="3" xs="6">
                <v-card dense class="date-time-card frosted cyberpunk-border flex-grow-0" elevation="12">
                  <v-card-title v-if="future" class="date-time-title justify-space-around text-center">Starts</v-card-title>
                  <v-card-title v-if="!future" class="date-time-title justify-space-around text-center">Started</v-card-title>
                  <v-card-text class="justify-space-around text-center flex-column">
                    <div class="date-text justify-space-around text-center">{{ startTimeString }}</div>
                    <div class="date-text justify-space-around text-center">{{ startDate }}</div>
                    <div class="date-text justify-space-around text-center">{{ startTime }}</div>
                  </v-card-text>
                  <v-card-actions class="justify-space-around text-center"><v-btn small text color="primary">Set Start Time</v-btn></v-card-actions>
                </v-card>
              </v-col>
              <v-col md="2" sm="3" xs="6">
                <v-card dense class="date-time-card frosted cyberpunk-border" elevation="12">
                  <v-card-title v-if="endDate && !past" class="date-time-title justify-space-around text-center">Ends</v-card-title>
                  <v-card-title v-if="endDate && past" class="date-time-title justify-space-around text-center">Ended</v-card-title>
                  <v-card-title v-if="!endDate" class="date-time-title justify-space-around text-center">Ongoing</v-card-title>
                  <v-card-text class="">
                    <div class="date-text justify-space-around text-center">{{ endTimeString }}</div>
                    <div class="date-text justify-space-around text-center">{{ endDate }}</div>
                    <div class="date-text text-center" :min-height="42"><v-icon x-large>mdi-infinity</v-icon></div>
                    <div class="date-text justify-space-around text-center">{{ endTime }}</div>
                  </v-card-text>
                  <v-card-actions class="justify-space-around text-center"><v-btn small text color="primary">Set End Time</v-btn></v-card-actions>
                </v-card>
              </v-col>
              <v-col md="8" sm="6" xs="12">
                <div class="d-flex flex-column align-stretch justify-stretch flex-grow-2">
                  <v-text-field label="Title" v-model="event.name"></v-text-field>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </div>
    <v-container>
      <v-row>
        <v-col>
          <v-card>
            <v-card-title class="d-flex justify-space-between align-start">
              <div>Event Attendees</div>
            </v-card-title>
            <v-card-text class="text-center"> Analytics coming soon... </v-card-text>
          </v-card>
        </v-col>
        <v-col>
          <v-card>
            <v-card-title class="d-flex justify-space-between align-start"
              ><div>Giveaways</div>
              <v-btn><v-icon class="mr-1">mdi-link</v-icon>Link Giveaway</v-btn></v-card-title
            >
            <giveaway-stats-card :event="event"></giveaway-stats-card>
            <v-card-text>
              <div v-for="(giveaway, i) in event?.giveaways" :key="i" class="text-center d-flex justify-center"><giveaway-card :giveaway="giveaway" :event="event" :key="i"></giveaway-card></div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col>
          <v-card>
            <v-card-title class="d-flex justify-space-between align-start"
              ><div>Giveaway Claims</div>
              <v-btn><v-icon class="mr-1">mdi-export</v-icon>Export CSV</v-btn>
            </v-card-title>
            <v-card-text class="text-center">Claim data coming soon...</v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </focus-page>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { DateTime } from "luxon";
import eventImgPlaceholder from "@/assets/placeholder.png";
import FocusPage from "../components/FocusPage";
import GiveawayCard from "../components/GiveawayCard.vue";
import GiveawayStatsCard from "../components/GiveawayStatsCard.vue";

export default {
  name: "Event",
  components: {
    FocusPage,
    GiveawayCard,
    GiveawayStatsCard,
  },
  data: () => ({
    showParcelMap: false,
    editingName: false,
    deleteScreenDialog: false,
    updateHistoryDialog: false,
    editingScreenName: false,
    tab: null,
    headers: [
      { text: "Giveaway Item", value: "itemName" },
      { text: "Recipient", value: "userDisplayName" },
    ],
  }),

  mounted() {
    this.setActiveEvent(this.$route.params.eventId);
    this.getEvent(this.$route.params.eventId);
  },
  beforeDestroy() {
    this.clearActiveEvent();
  },
  computed: {
    event() {
      return this.$store.state.event.activeEvent || {};
    },
    loading() {
      return this.$store.state.event.processing;
    },
    placeholder() {
      return eventImgPlaceholder;
    },
    claims() {
      return [];
    },
    worlds() {
      const worldNames = [];
      if (this.event.worlds) {
        this.event.worlds.forEach((world) => {
          switch (world) {
            case 0:
              worldNames.push("Decentraland");
              break;
            case 1:
              worldNames.push("Hyperfy");
          }
        });
      }
      return worldNames.join(", ") || "None";
    },
    startDate() {
      if (!this.event?.startTime) {
        return "";
      }
      return DateTime.fromMillis(this.event.startTime).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);
    },
    startTime() {
      if (!this.event?.startTime) {
        return "";
      }
      return DateTime.fromMillis(this.event.startTime).toLocaleString(DateTime.TIME_WITH_SECONDS);
    },
    startTimeString() {
      if (!this.event?.startTime) {
        return "";
      }
      return DateTime.fromMillis(this.event.startTime).toRelative();
    },
    endDate() {
      if (!this.event?.endTime) {
        return "";
      }
      return DateTime.fromMillis(this.event.endTime).toLocaleString(DateTime.DATE_MED);
    },
    endTime() {
      if (!this.event?.endTime) {
        return "";
      }
      return DateTime.fromMillis(this.event.endTime).toLocaleString(DateTime.TIME_WITH_SECONDS);
    },
    endTimeString() {
      if (!this.event?.endTime) {
        return "";
      }
      return DateTime.fromMillis(this.event.endTime).toRelative();
    },
    ongoing() {
      if (!this.event) {
        return null;
      }
      return DateTime.now().toMillis() >= this.event.startTime && (!this.event.endTime || DateTime.now().toMillis() <= this.event.endTime);
    },
    future() {
      if (!this.event) {
        return "";
      }
      return DateTime.now().toMillis() < this.event.startTime;
    },
    past() {
      if (!this.event) {
        return "";
      }
      return DateTime.now().toMillis() > this.event.endTime;
    },
    ...mapGetters({ user: "user/userInfo" }),
  },
  methods: {
    ...mapActions({
      setActiveEvent: "event/setActiveEvent",
      clearActiveEvent: "event/clearActiveEvent",
      getEvent: "event/getEvent",
      sendUiMessage: "moderation/sendUiMessage",
    }),
    sendMessage(options) {
      this.sendUiMessage({
        wssMessages: {
          ...options.wssMessages,
        },
        event: {
          eventName: this.event.eventName,
          baseParcel: this.event.baseParcel,
          eventData: this.event.eventData,
          tokenId: this.event.tokenId,
        },
      });
    },
    goBack() {
      this.$router.go(-1);
    },
    connectEvent() {
      return false;
    },
    getDateTime(timestamp) {
      return DateTime.fromMillis(timestamp).toLocaleString(DateTime.DATETIME_SHORT);
    },
  },
};
</script>

<style scoped>
.date-text  {
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
