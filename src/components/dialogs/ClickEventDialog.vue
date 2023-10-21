<template>
  <v-dialog v-model="show" max-width="400" persistent>
    <instance-click-event v-if="instance" :element="element" :instanceData="instanceData" :elementData="elementData"
      @onUpdate="updateInstance" />
    <default-click-event v-else :element="element" :elementData="elementData" @onUpdate="updateElement" />
  </v-dialog>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
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
  computed: {
    ...mapGetters({ show: "dialog/clickEventDialogOpen", dialogProps: "dialog/clickEventDialogProps" }),
    element() {
      return this.dialogProps.element;
    },
    elementData() {
      return this.dialogProps.elementData;
    },
    instance() {
      return this.dialogProps.instance;
    },
    instanceData() {
      return this.dialogProps.instanceData;
    },
  },
  methods: {
    ...mapActions({ updateSceneElement: "scene/updateSceneElement", showClickEventDialog: "dialog/showClickEventDialog", hideClickEventDialog: "dialog/hideClickEventDialog" }),
    updateInstance(clickEvent, done) {
      if (done) {
        this.hideClickEventDialog();
      }
      this.updateSceneElement({ element: this.element, property: "clickEvent", elementData: this.elementData, instance: true, id: this.instanceData?.sk, instanceData: { ...this.instanceData, clickEvent } });
    },
    updateElement(clickEvent, done) {
      if (done) {
        this.hideClickEventDialog();
      }
      this.updateSceneElement({ element: this.element, property: "clickEvent", elementData: { ...this.elementData, clickEvent } });
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
}</style>
