<template>
  <div>
    <div class="d-flex mx-auto align-baseline justify-start">
      <div class="text-h5 flex-grow-1">Events</div>
    </div>

    <input style="display: none" ref="fileInput" type="file" accept=".png,.jpg,.jpeg" @change="linkEvent" />
    <div v-if="linkedEvents.length < 1" class="mt-6">
      <div class="text-body-1 text-center">There are no events linked to this this scene</div>
    </div>
    <div v-if="linkedEvents.length > 0">
      <v-container>
        <v-row>
          <v-col md="4" sm="12" v-for="(event, i) in linkedEvents" :key="i">
            <router-link :to="`event/${event.sk}`" class="event-card-link">
            <event-card :event="event" @updateProperties="updateProperties" />
            </router-link>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import EventCard from "./EventCard";

export default {
  components: {
    EventCard,
  },
  name: "SceneImageList",
  data: () => ({
    clickEventDialog: false,
    propertiesDialog: false,
    transformDialog: false,
    deleteDialog: false,
    detailedMode: true,
    selectedImage: "",
    dialogCallback: () => { },
  }),
  computed: {
    ...mapGetters({
      activeScene: "scene/activeScene",
      eventsForScene: "event/eventsForScene",
    }),
    linkedEvents() {
      return this.eventsForScene(this.activeScene?.sk);
    },
  },
  methods: {
    linkEvent() {
      this.$refs.fileInput.click();
    },
    updateProperties(wssMessages) {
      this.$emit("updateProperties", { wssMessages });
    },
  },
};
</script>
