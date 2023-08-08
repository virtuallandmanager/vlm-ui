<template>
  <focus-page :loadingMessage="`Loading ${event?.name}`" :loading="loading" :noContent="!event" :imageLink="event?.imageLink || placeholder">
    <template v-slot:header>{{ event?.name }}</template>
    <template v-slot:header-actions></template>
    <template v-slot:no-content-header>Could Not Load Giveaway</template>
    <template v-slot:no-content-text> Please try again and contact support if the problem continues. </template>
    <div class="">
      <v-card class="cyberpunk-border ma-2">
        <v-card-text>
          <v-container>
            <v-row>
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
              <div>Giveaways</div>
              <v-btn>
                <v-icon class="mr-1">mdi-link</v-icon>
                Link Giveaway
              </v-btn>
            </v-card-title>
            <giveaway-stats-card :event="event"></giveaway-stats-card>
            <v-card-text>
              <div v-for="(giveaway, i) in event?.giveaways" :key="i" class="text-center d-flex justify-center"><giveaway-card :giveaway="giveaway" :event="event" :key="i"></giveaway-card></div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </focus-page>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { DateTime } from "luxon";
import FocusPage from "../components/FocusPage";

export default {
  name: "Giveaway",
  components: {
    FocusPage,
  },
  data: () => ({}),

  mounted() {},
  beforeDestroy() {},
  computed: {
    loading() {
      return this.$store.state.giveaway.processing;
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
