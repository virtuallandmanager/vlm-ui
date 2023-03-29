<template>
  <v-dialog v-model="show" max-width="400" persistent>
    <v-card>
      <v-card-title>
        {{ !instance ? "Default" : instance.name.capitalize() }} Click Action
      </v-card-title>
      <v-divider></v-divider>
      <v-card-subtitle class="pa-6 d-flex flex-column">
        <v-switch
          v-if="instance"
          v-model="override"
          dense
          :label="`Override ${entityType.capitalize()} Defaults`"
          @change="toggleSync"
        >
        </v-switch>
        <div v-if="!instance">
          <v-icon small>mdi-information-outline</v-icon>
          This will be the default click behavior used by new instances. You can
          make individual instances do something different if needed.
        </div>
        <div v-if="instance && !override" class="text-caption">
          <v-icon small>mdi-information-outline</v-icon>
          This instance uses the default click behavior set for the
          {{ entity.name }} {{ entityType }}.
        </div>
        <div
          v-if="instance && override && !formState.matchesDefault"
          class="text-caption"
        >
          <v-icon small>mdi-information-outline</v-icon>
          This instance has a unique click behavior.
        </div>
        <div
          v-if="instance && override && formState.matchesDefault"
          class="text-caption"
        >
          <v-icon small>mdi-information-outline</v-icon>
          This instance's click behavior currently matches the default behavior
          for the
          {{ entity.name }} {{ entityType }}. The two are unlinked and will not
          stay in sync if the default settings are changed. To keep this
          instance in sync, disable 'Override
          {{ entityType.capitalize() }} Defaults'.
        </div>
        <v-btn
          v-if="instance && override && !formState.matchesDefault"
          small
          class="mt-4 align-self-center"
          @click="restoreDefaults"
        >
          <v-icon small class="mr-1">mdi-restore</v-icon> Restore
          {{ entityType.capitalize() }} Defaults
        </v-btn>
      </v-card-subtitle>
      <v-divider></v-divider>
      <v-card-text>
        <!-- <div class="d-flex align-center justify-start"> -->
        <!-- </div> -->
        <v-select
          v-model="displayedClickEvent.type"
          label="Click Behavior"
          :items="clickEvents"
          class="mt-4"
          @change="changeType"
          :disabled="displayedClickEvent && displayedClickEvent.synced"
        ></v-select>
        <v-text-field
          v-if="
            displayedClickEvent &&
            displayedClickEvent.type == this.EClickEventType.EXTERNAL
          "
          v-model="displayedClickEvent.externalLink"
          label="External Link"
          :rules="[validateExternalLink]"
          dense
          @change="changeValue"
          :disabled="displayedClickEvent && displayedClickEvent.synced"
        ></v-text-field>
        <v-text-field
          v-if="
            displayedClickEvent &&
            displayedClickEvent.type == this.EClickEventType.SOUND
          "
          v-model="displayedClickEvent.sound"
          label="Audio File"
          dense
          @change="changeValue"
          :disabled="displayedClickEvent.synced"
        ></v-text-field>
        <div
          v-if="
            displayedClickEvent &&
            displayedClickEvent.type == this.EClickEventType.MOVE
          "
        >
          <div class="display-caption">Position</div>
          <div class="d-inline-flex align-content-space-between coords">
            <v-text-field
              v-model="displayedClickEvent.moveTo.position.x"
              label="X"
              @change="changeMoveTo"
              :disabled="displayedClickEvent.synced"
              type="number"
            ></v-text-field>
            <v-text-field
              v-model="displayedClickEvent.moveTo.position.y"
              label="Y"
              @change="changeMoveTo"
              :disabled="displayedClickEvent.synced"
              type="number"
            ></v-text-field>
            <v-text-field
              v-model="displayedClickEvent.moveTo.position.z"
              label="Z"
              @change="changeMoveTo"
              :disabled="displayedClickEvent.synced"
              type="number"
            ></v-text-field>
          </div>
          <v-switch
            v-if="
              displayedClickEvent &&
              displayedClickEvent.type !== EClickEventType.NONE
            "
            v-model="displayedClickEvent.moveTo.setCameraTarget"
            label="Set New Camera Target"
            @change="toggleSetCameraTarget"
            :disabled="displayedClickEvent && displayedClickEvent.synced"
          ></v-switch>
          <div
            v-if="
              displayedClickEvent &&
              displayedClickEvent.moveTo &&
              displayedClickEvent.moveTo.setCameraTarget
            "
          >
            <div class="display-caption">Camera Target</div>
            <div class="d-inline-flex align-content-space-between coords">
              <v-text-field
                v-model="displayedClickEvent.moveTo.cameraTarget.x"
                label="X"
                @change="changeMoveTo"
                :disabled="displayedClickEvent.synced"
                type="number"
              ></v-text-field>
              <v-text-field
                v-model="displayedClickEvent.moveTo.cameraTarget.y"
                label="Y"
                @change="changeMoveTo"
                :disabled="displayedClickEvent.synced"
                type="number"
              ></v-text-field>
              <v-text-field
                v-model="displayedClickEvent.moveTo.cameraTarget.z"
                label="Z"
                @change="changeMoveTo"
                :disabled="displayedClickEvent && displayedClickEvent.synced"
                type="number"
              ></v-text-field>
            </div>
          </div>
        </div>
        <v-text-field
          v-if="
            displayedClickEvent &&
            displayedClickEvent.type == this.EClickEventType.TELEPORT
          "
          v-model="displayedClickEvent.teleportTo"
          label="Destination Coordinates"
          dense
          placeholder="0,0"
          @change="changeValue"
          :disabled="displayedClickEvent && displayedClickEvent.synced"
        ></v-text-field>
        <v-switch
          v-if="
            displayedClickEvent &&
            displayedClickEvent.type > EClickEventType.NONE
          "
          v-model="displayedClickEvent.showFeedback"
          label="Show Hover Text"
          @change="toggleHoverText"
          :disabled="displayedClickEvent && displayedClickEvent.synced"
        ></v-switch>
        <v-text-field
          v-if="
            displayedClickEvent &&
            displayedClickEvent.type > EClickEventType.NONE &&
            displayedClickEvent.showFeedback
          "
          v-model="displayedClickEvent.hoverText"
          label="Hover Text"
          dense
          @change="changeValue"
          :rules="[validateHoverText]"
          :disabled="displayedClickEvent && displayedClickEvent.synced"
        ></v-text-field>
        <v-switch
          v-if="
            displayedClickEvent &&
            displayedClickEvent.type !== EClickEventType.NONE
          "
          v-model="displayedClickEvent.hasTracking"
          label="Track Click Event"
          @change="toggleTracking"
          :disabled="displayedClickEvent && displayedClickEvent.synced"
        ></v-switch>
        <v-text-field
          v-if="
            displayedClickEvent &&
            displayedClickEvent.type !== EClickEventType.NONE &&
            displayedClickEvent.hasTracking
          "
          v-model="displayedClickEvent.trackingId"
          label="Tracking ID"
          dense
          @change="changeValue"
          :rules="[validateTrackingId]"
          :disabled="displayedClickEvent && displayedClickEvent.synced"
        ></v-text-field>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="accenttext" text @click="save"> Save </v-btn>
        <v-btn color="grey darken-1" text @click="revert"> Cancel </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from "vue";
import { ClickEvent } from "../../models/ClickEvent";

export default {
  name: "ClickEventDialog",
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
  mounted() {
    const isInstance = !!this.instance,
      isInstanceGroup = !isInstance,
      isInstanceWithClickEvent = isInstance && !!this.instance.clickEvent,
      needsClickEvent =
        (isInstanceGroup && !this.entity.clickEvent) ||
        (isInstance && !this.instance.clickEvent),
      entityHasClickEvent = this.entity && !!this.entity.clickEvent;

    this.synced =
      isInstance && isInstanceWithClickEvent && this.instance.clickEvent.synced;

    if (this.synced) {
      this.clickEvent = this.instance.clickEvent;
      this.displayedClickEvent = {
        ...new ClickEvent(),
        ...this.entity.clickEvent,
        synced: true,
      };
    } else if (isInstanceWithClickEvent) {
      this.clickEvent = this.instance.clickEvent;
      this.displayedClickEvent = {
        ...new ClickEvent(),
        ...this.instance.clickEvent,
        synced: null,
      };
    } else if (isInstance && entityHasClickEvent) {
      this.clickEvent = this.entity.clickEvent;
      this.displayedClickEvent = {
        ...new ClickEvent(),
        ...this.entity.clickEvent,
        synced: true,
      };
    } else if (!isInstance && entityHasClickEvent) {
      this.clickEvent = this.entity.clickEvent;
      this.displayedClickEvent = {
        ...new ClickEvent(),
        ...this.entity.clickEvent,
        synced: null,
      };
    } else if (needsClickEvent) {
      this.clickEvent = new ClickEvent();
      this.displayedClickEvent = this.clickEvent;
    } else {
      return;
    }

    this.originalClickEvent = { ...this.displayedClickEvent };
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
    override: {
      get() {
        return !this.displayedClickEvent.synced;
      },
      set(value) {
        this.displayedClickEvent.synced = value;
      },
    },
    formState() {
      const displayedClickEvent = { ...this.displayedClickEvent },
        originalClickEvent = { ...this.originalClickEvent },
        defaultClickEvent = { ...this.entity.clickEvent };

      delete displayedClickEvent.synced;
      delete defaultClickEvent.synced;
      delete originalClickEvent.synced;
      return {
        matchesDefault:
          JSON.stringify(displayedClickEvent) ===
          JSON.stringify(defaultClickEvent),
        matchesOriginal:
          JSON.stringify(displayedClickEvent) ===
          JSON.stringify(originalClickEvent),
      };
    },
  },
  methods: {
    save() {
      if (this.hasErrors) {
        return;
      }
      this.show = false;
      if (!this.instance) {
        Vue.set(this.entity, "clickEvent", this.displayedClickEvent);
      } else {
        Vue.set(this.instance, "clickEvent", this.displayedClickEvent);
      }
    },
    revert() {
      this.show = false;
      if (this.instance) {
        Vue.set(this.instance, "clickEvent", this.originalClickEvent);
      } else {
        Vue.set(this.entity, "clickEvent", this.originalClickEvent);
      }
      Vue.nextTick(() => {
        this.$emit("onChange");
      });
    },
    changeType() {
      if (this.displayedClickEvent.type == this.EClickEventType.TRACKING_ONLY) {
        this.displayedClickEvent.hasTracking = true;
      }
      if (
        this.displayedClickEvent &&
        (!this.displayedClickEvent.moveTo ||
          !this.displayedClickEvent.moveTo.position ||
          !this.displayedClickEvent.moveTo.cameraTarget)
      ) {
        this.displayedClickEvent.moveTo = new ClickEvent().moveTo;
      }
      this.hasErrors = false;
      this.setClickTrackingId();
      this.changeValue();
    },
    changeValue() {
      if (this.instance) {
        Vue.set(this.instance, "clickEvent", this.displayedClickEvent);
      } else {
        Vue.set(this.entity, "clickEvent", this.displayedClickEvent);
      }
      Vue.nextTick(() => {
        if (this.hasErrors) {
          return;
        }
        this.$emit("onChange");
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
      Vue.set(
        this.displayedClickEvent.moveTo,
        "position",
        this.displayedClickEvent.moveTo.position
      );
      Vue.set(
        this.displayedClickEvent.moveTo,
        "cameraTarget",
        this.displayedClickEvent.moveTo.cameraTarget
      );
      Vue.set(
        this.displayedClickEvent.moveTo,
        "setCameraTarget",
        this.displayedClickEvent.moveTo.setCameraTarget
      );
      this.changeValue();
    },
    toggleSync(override) {
      if (!override) {
        this.displayedClickEvent = {
          ...this.entity.clickEvent,
          synced: !override,
        };
      } else {
        this.displayedClickEvent = {
          ...this.instance.clickEvent,
          synced: !override,
        };
        this.hasErrors = false;
      }
      this.changeValue();
    },
    restoreDefaults() {
      this.displayedClickEvent = {
        ...this.entity.clickEvent,
      };
      this.hasErrors = false;
      this.changeValue();
    },
    setClickTrackingId() {
      let clickTrackingId;
      let defaultTrackingName;

      if (this.instance) {
        defaultTrackingName =
          this.instance.customId || this.instance.name || this.entity.name;
      } else {
        defaultTrackingName = this.entity.customId || this.entity.name;
      }

      if (
        this.displayedClickEvent.trackingId ||
        this.displayedClickEvent.type == this.EClickEventType.NONE
      ) {
        //do nothing
      } else if (
        this.displayedClickEvent.type == this.EClickEventType.EXTERNAL
      ) {
        clickTrackingId = `click-event-(external-link)-${
          this.clickEvent.externalLink || defaultTrackingName
        }`;
      } else if (
        this.displayedClickEvent.type == this.EClickEventType.TRACKING_ONLY
      ) {
        clickTrackingId = `click-event-${
          this.clickEvent.sound || defaultTrackingName
        }`;
      } else if (this.displayedClickEvent.type == this.EClickEventType.SOUND) {
        clickTrackingId = `click-event-(play-sound)-${
          this.clickEvent.sound || defaultTrackingName
        }`;
      } else if (this.displayedClickEvent.type == this.EClickEventType.STREAM) {
        clickTrackingId = `click-event-(play-stream)-${defaultTrackingName}`;
      } else if (this.displayedClickEvent.type == this.EClickEventType.MOVE) {
        clickTrackingId = `click-event-(move-player)-${defaultTrackingName}`;
      } else if (
        this.displayedClickEvent.type == this.EClickEventType.TELEPORT
      ) {
        clickTrackingId = `click-event-(teleport-player)-${
          this.clickEvent.teleportTo || defaultTrackingName
        }`;
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
