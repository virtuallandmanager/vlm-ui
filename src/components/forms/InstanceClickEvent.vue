<template>
  <v-card>
    <v-card-title>Click Action</v-card-title>
    <v-card-subtitle>{{ elementData.name.capitalize() }}</v-card-subtitle>
    <v-divider></v-divider>
    <v-card-subtitle class="pa-6 d-flex flex-column">
      <v-switch v-model="synced" dense :true-value="false" :false-value="true" :label="`Override Default Click Action`" @change="toggleSync"> </v-switch>
      <div v-if="synced" class="text-caption">
        <v-icon small>mdi-information-outline</v-icon>
        This instance uses the default click behavior set for the
        {{ elementData.name }} {{ element }}.
      </div>
      <div v-if="!synced && !formState.matchesDefault" class="text-caption">
        <v-icon small>mdi-information-outline</v-icon>
        This instance has a unique click behavior.
      </div>
      <div v-if="!synced && formState.matchesDefault" class="text-caption">
        <v-icon small>mdi-information-outline</v-icon>
        This instance's click behavior currently matches the default behavior for the
        {{ elementData.name }} {{ element }}. The two are unlinked and will not stay in sync if the default settings are changed. To keep this instance in sync, disable 'synced {{ element.capitalize() }} Defaults'.
      </div>
      <v-btn v-if="!synced && !formState.matchesDefault" small class="mt-4 align-self-center" @click="restoreDefaults"> <v-icon small class="mr-1">mdi-restore</v-icon> Restore {{ element.capitalize() }} Defaults </v-btn>
    </v-card-subtitle>
    <v-divider></v-divider>
    <v-card-text>
      <v-select v-model="displayedClickEvent.type" label="Click Behavior" :items="clickEvents" class="mt-4" @change="changeType" :disabled="synced"></v-select>
      <v-text-field
        v-if="displayedClickEvent && displayedClickEvent.type == this.EClickEventType.EXTERNAL"
        v-model="displayedClickEvent.externalLink"
        label="External Link"
        :rules="[validateExternalLink]"
        dense
        @change="changeValue"
        :disabled="synced"></v-text-field>
      <v-text-field v-if="displayedClickEvent && displayedClickEvent.type == this.EClickEventType.SOUND" v-model="displayedClickEvent.sound" label="Audio File" dense @change="changeValue" :disabled="synced"></v-text-field>
      <div v-if="displayedClickEvent && displayedClickEvent.type == this.EClickEventType.MOVE">
        <div class="display-caption">Position</div>
        <div class="d-inline-flex align-content-space-between coords">
          <v-text-field v-model="displayedClickEvent.moveTo.position.x" label="X" @change="changeMoveTo" :disabled="synced" type="number"></v-text-field>
          <v-text-field v-model="displayedClickEvent.moveTo.position.y" label="Y" @change="changeMoveTo" :disabled="synced" type="number"></v-text-field>
          <v-text-field v-model="displayedClickEvent.moveTo.position.z" label="Z" @change="changeMoveTo" :disabled="synced" type="number"></v-text-field>
        </div>
        <v-switch v-if="displayedClickEvent && displayedClickEvent.type !== EClickEventType.NONE" v-model="displayedClickEvent.moveTo.setCameraTarget" label="Set New Camera Target" @change="toggleSetCameraTarget" :disabled="synced"></v-switch>
        <div v-if="displayedClickEvent && displayedClickEvent.moveTo && displayedClickEvent.moveTo.setCameraTarget">
          <div class="display-caption">Camera Target</div>
          <div class="d-inline-flex align-content-space-between coords">
            <v-text-field v-model="displayedClickEvent.moveTo.cameraTarget.x" label="X" @change="changeMoveTo" :disabled="synced" type="number"></v-text-field>
            <v-text-field v-model="displayedClickEvent.moveTo.cameraTarget.y" label="Y" @change="changeMoveTo" :disabled="synced" type="number"></v-text-field>
            <v-text-field v-model="displayedClickEvent.moveTo.cameraTarget.z" label="Z" @change="changeMoveTo" :disabled="synced" type="number"></v-text-field>
          </div>
        </div>
      </div>
      <v-text-field
        v-if="displayedClickEvent && displayedClickEvent.type == this.EClickEventType.TELEPORT"
        v-model="displayedClickEvent.teleportTo"
        label="Destination Coordinates"
        dense
        placeholder="0,0"
        @change="changeValue"
        :disabled="synced"></v-text-field>
      <v-switch v-if="displayedClickEvent && displayedClickEvent.type > EClickEventType.NONE" v-model="displayedClickEvent.showFeedback" label="Show Hover Text" @change="toggleHoverText" :disabled="synced"></v-switch>
      <v-text-field
        v-if="displayedClickEvent && displayedClickEvent.type > EClickEventType.NONE && displayedClickEvent.showFeedback"
        v-model="displayedClickEvent.hoverText"
        label="Hover Text"
        dense
        @change="changeValue"
        :rules="[validateHoverText]"
        :disabled="synced"></v-text-field>
      <v-switch v-if="displayedClickEvent && displayedClickEvent.type !== EClickEventType.NONE" v-model="displayedClickEvent.hasTracking" label="Track Click Event" @change="toggleTracking" :disabled="synced"></v-switch>
      <v-text-field
        v-if="displayedClickEvent && displayedClickEvent.type !== EClickEventType.NONE && displayedClickEvent.hasTracking"
        v-model="displayedClickEvent.trackingId"
        label="Tracking ID"
        dense
        @change="changeValue"
        :rules="[validateTrackingId]"
        :disabled="synced"></v-text-field>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="accenttext" text @click="save"> Save </v-btn>
      <v-btn color="grey darken-1" text @click="revert"> Cancel </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import Vue from "vue";
import { ClickEvent } from "../../models/ClickEvent";

export default {
  name: "InstanceClickEvent",
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
    synced: false,
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
    instanceData: {
      type: [Object, null],
      default: () => null,
    },
    elementData: {
      type: [Object, null],
      default: () => null,
    },
    element: {
      type: String,
      default: "Image",
    },
  },
  mounted() {
    this.defaultClickEvent = { ...this.elementData.clickEvent };
    this.clickEvent = { ...this.instanceData.clickEvent };
    this.originalClickEvent = { ...this.clickEvent };
    this.synced = this.clickEvent.synced;
    this.displayedClickEvent = !this.synced ? { ...this.clickEvent, synced: false } : { ...this.defaultClickEvent, synced: true };
  },
  computed: {
    formState() {
      const displayedClickEvent = { ...this.displayedClickEvent },
        originalClickEvent = { ...this.originalClickEvent },
        defaultClickEvent = { ...this.elementData.clickEvent };

      delete displayedClickEvent.synced;
      delete defaultClickEvent.synced;
      delete originalClickEvent.synced;
      return {
        matchesDefault: JSON.stringify(displayedClickEvent) === JSON.stringify(defaultClickEvent),
        matchesOriginal: JSON.stringify(displayedClickEvent) === JSON.stringify(originalClickEvent),
      };
    },
  },
  methods: {
    save() {
      if (this.hasErrors) {
        return;
      }
      this.$emit("onUpdate", this.displayedClickEvent, true);
    },
    revert() {
      this.$emit("onUpdate", this.originalClickEvent, true);
    },
    changeType() {
      if (this.displayedClickEvent.type == this.EClickEventType.TRACKING_ONLY) {
        this.displayedClickEvent.hasTracking = true;
      }
      if (this.displayedClickEvent && (!this.displayedClickEvent.moveTo || !this.displayedClickEvent.moveTo.position || !this.displayedClickEvent.moveTo.cameraTarget)) {
        this.displayedClickEvent.moveTo = new ClickEvent().moveTo;
      }
      this.hasErrors = false;
      this.setClickTrackingId();
      this.changeValue();
    },
    changeValue() {
      if (this.displayedClickEvent.synced) {
        Vue.set(this.instanceData, "clickEvent", this.displayedClickEvent);
      } else {
        Vue.set(this.instanceData, "clickEvent", this.displayedClickEvent);
      }

      Vue.nextTick(() => {
        if (this.hasErrors) {
          return;
        }
        this.$emit("onUpdate", this.displayedClickEvent);
      });
    },
    toggleHoverText(value) {
      Vue.set(this.displayedClickEvent, "showFeedback", value);
      if (!value) {
        this.hasErrors = false;
      }
      this.changeValue();
    },
    toggleTracking(value) {
      if (!value) {
        this.hasErrors = false;
      } else {
        this.setClickTrackingId();
      }
      this.changeValue();
    },
    toggleSetCameraTarget(value) {
      Vue.set(this.displayedClickEvent.moveTo, "setCameraTarget", value);
      this.changeValue();
    },
    changeMoveTo() {
      Vue.set(this.displayedClickEvent.moveTo, "position", this.displayedClickEvent.moveTo.position);
      Vue.set(this.displayedClickEvent.moveTo, "cameraTarget", this.displayedClickEvent.moveTo.cameraTarget);
      Vue.set(this.displayedClickEvent.moveTo, "setCameraTarget", this.displayedClickEvent.moveTo.setCameraTarget);
      this.changeValue();
    },
    toggleSync() {
      if (this.synced) {
        this.displayedClickEvent = { ...this.defaultClickEvent, synced: true };
      } else {
        this.displayedClickEvent = { ...this.clickEvent, synced: false };
      }
      this.hasErrors = false;
      this.changeValue();
    },
    restoreDefaults() {
      this.displayedClickEvent = {
        ...this.elementData.clickEvent,
      };
      this.hasErrors = false;
      this.changeValue();
    },
    setClickTrackingId() {
      let clickTrackingId;
      let defaultTrackingName = this.instanceData.customId || this.instanceData.name;

      if (this.displayedClickEvent?.trackingId || this.displayedClickEvent?.type == this.EClickEventType.NONE) {
        //do nothing
      } else if (this.displayedClickEvent?.type == this.EClickEventType.EXTERNAL) {
        clickTrackingId = `click_event_(external_link)_${this.displayedClickEvent?.externalLink || defaultTrackingName}`;
      } else if (this.displayedClickEvent?.type == this.EClickEventType.TRACKING_ONLY) {
        clickTrackingId = `click_event_${this.displayedClickEvent?.sound || defaultTrackingName}`;
      } else if (this.displayedClickEvent.type == this.EClickEventType.SOUND) {
        clickTrackingId = `click_event_(play_sound)_${this.displayedClickEvent?.sound || defaultTrackingName}`;
      } else if (this.displayedClickEvent?.type == this.EClickEventType.STREAM) {
        clickTrackingId = `click_event_(play_stream)_${defaultTrackingName}`;
      } else if (this.displayedClickEvent?.type == this.EClickEventType.MOVE) {
        clickTrackingId = `click_event_(move_player)_${defaultTrackingName}`;
      } else if (this.displayedClickEvent?.type == this.EClickEventType.TELEPORT) {
        clickTrackingId = `click_event_(teleport_player)_${this.displayedClickEvent?.teleportTo || defaultTrackingName}`;
      }

      if (clickTrackingId) {
        this.displayedClickEvent.trackingId = clickTrackingId;
        this.changeValue();
      }
    },
    validateExternalLink(value) {
      if (!value) {
        this.hasErrors = true;
        return "Enter a website URL";
      } else if (value.includes("https://")) {
        this.hasErrors = false;
        return true;
      } else {
        this.hasErrors = true;
        return "Must use https:// links";
      }
    },
    validateHoverText(value) {
      if (!value) {
        this.hasErrors = true;
        return "Enter text or disable toggle";
      } else {
        this.hasErrors = false;
        return true;
      }
    },
    validateTrackingId(value) {
      if (!value) {
        this.hasErrors = true;
        return "Enter text or disable toggle";
      } else {
        this.hasErrors = false;
        return true;
      }
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
