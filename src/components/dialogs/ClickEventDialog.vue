<template>
  <v-dialog v-model="show" max-width="400" persistent>
    <instance-click-event
      v-if="instance"
      :instance="instance"
      :entity="entity"
      @onUpdate="update"
    />
    <default-click-event v-else :entity="entity" @onUpdate="update" />
  </v-dialog>
</template>

<script>
import Vue from "vue";
import { ClickEvent } from "../../models/ClickEvent";
import InstanceClickEvent from "../forms/InstanceClickEvent.vue";
import DefaultClickEvent from "../forms/DefaultClickEvent.vue";

export default {
  name: "ClickEventDialog",
  components: { InstanceClickEvent, DefaultClickEvent },
  data: () => ({
    clickEvent: null,
    originalClickEvent: null,
    displayedClickEvent: new ClickEvent(),
    baseEntityType: "",
    hasErrors: false,
    EClickEventType: {
      NONE: 0,
      EXTERNAL: 1,
      TRACKING_ONLY: 2,
      SOUND: 3,
      STREAM: 4,
      MOVE: 5,
      TELEPORT: 6,
    },
    clickEvents: [
      { text: "None", value: 0, default: true },
      { text: "Tracking Only", value: 2 },
      { text: "Website Link", value: 1 },
      { text: "Play Sound", value: 3 },
      // { text: 'Play Audio Stream (Coming Soon)', value: this.EClickEventType.STREAM },
      { text: "Move Player in Scene", value: 5 },
      { text: "Teleport Player", value: 6 },
    ],
  }),
  props: {
    title: { type: String, default: "Default Click Event" },
    entity: {
      type: Object,
    },
    instance: {
      type: [Object, null],
      default: () => null,
    },
    entityType: { type: String, default: "entity" },
    value: Boolean,
  },
  computed: {
    show: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
  },
  methods: {
    update(clickEvent, done) {
      if (done) {
        this.show = false;
      }
      if (!this.instance) {
        Vue.set(this.entity, "clickEvent", clickEvent);
      } else {
        Vue.set(this.instance, "clickEvent", clickEvent);
      }
      Vue.nextTick(() => {
        this.$emit("onChange");
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.coords {
  .v-input {
    padding-right: 4px;
    padding-left: 4px;
    &:first-child {
      padding-right: 4px;
      padding-left: 0;
    }
    &:last-child {
      padding-right: 0;
      padding-left: 4px;
    }
  }
}
</style>
