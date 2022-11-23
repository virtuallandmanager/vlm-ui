<template>
  <v-dialog v-model="show" max-width="400" persistent>
    <v-card>
      <v-card-title class="text-h5">
        {{ title }}
      </v-card-title>
      <v-card-text>
        <div class="text-body2 mt-4" v-if="!instance">
          This click event will be inherited by all {{ entityType }} instances
        </div>
        <v-select
          v-model="displayedClickEvent.type"
          label="Click Event"
          :items="clickEvents"
          class="mt-4"
          @change="changeType"
          :disabled="displayedClickEvent.synced"
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
          :disabled="displayedClickEvent.synced"
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
        <v-text-field
          v-if="
            displayedClickEvent &&
              displayedClickEvent.type == this.EClickEventType.MOVE
          "
          v-model="displayedClickEvent.moveTo"
          label="In-Scene Coordinates"
          dense
          @change="changeValue"
          :disabled="displayedClickEvent.synced"
        ></v-text-field>
        <v-text-field
          v-if="
            displayedClickEvent &&
              displayedClickEvent.type == this.EClickEventType.TELEPORT
          "
          v-model="displayedClickEvent.teleportTo"
          label="Destination Coordinates"
          dense
          @change="changeValue"
          :disabled="displayedClickEvent.synced"
        ></v-text-field>
        <v-switch
          v-if="
            displayedClickEvent &&
              displayedClickEvent.type > EClickEventType.NONE
          "
          v-model="displayedClickEvent.showFeedback"
          label="Show Hover Text"
          @change="toggleHoverText"
          :disabled="displayedClickEvent.synced"
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
          :disabled="displayedClickEvent.synced"
        ></v-text-field>
        <v-switch
          v-if="
            displayedClickEvent &&
              displayedClickEvent.type !== EClickEventType.NONE
          "
          v-model="displayedClickEvent.hasTracking"
          label="Track Click Event"
          @change="toggleTracking"
          :disabled="displayedClickEvent.synced"
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
          :disabled="displayedClickEvent.synced"
        ></v-text-field>
        <div v-if="this.instance && !displayedClickEvent.synced">
          <v-icon small>mdi-alert</v-icon>
          This will override the default click event of the instance group.
        </div>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-switch
          v-if="instance"
          v-model="displayedClickEvent.synced"
          label="Use Default Click Event"
          @change="toggleSync"
        >
        </v-switch>
        <v-spacer></v-spacer>
        <v-btn color="accenttext" text @click="save" :disabled="hasErrors">
          Save
        </v-btn>
        <v-btn color="grey darken-1" text @click="revert"> Cancel </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from 'vue'
import { SceneImage } from '../../models/SceneImage'
import { ClickEvent } from '../../models/ClickEvent'

export default {
  name: 'ClickEventDialog',
  data: () => ({
    clickEvent: null,
    originalClickEvent: null,
    displayedClickEvent: null,
    baseEntityType: '',
    hasErrors: false,
    synced: false,
    EClickEventType: {
      NONE: 0,
      EXTERNAL: 1,
      TRACKING_ONLY: 2,
      SOUND: 3,
      STREAM: 4,
      MOVE: 5,
      TELEPORT: 6
    },
    clickEvents: [
      { text: 'None', value: 0, default: true },
      { text: 'Tracking Only', value: 2 },
      { text: 'Website Link', value: 1 },
      { text: 'Play Sound', value: 3 },
      // { text: 'Play Audio Stream (Coming Soon)', value: this.EClickEventType.STREAM },
      { text: 'Move Player in Scene', value: 5 },
      { text: 'Teleport Player', value: 6 }
    ]
  }),
  props: {
    title: { type: String, default: 'Default Click Event' },
    entity: {
      type: Object,
      default: () => new SceneImage()
    },
    instance: {
      type: [Object, null],
      default: () => {
        return null
      }
    },
    entityType: { type: String, default: 'entity' },
    value: Boolean
  },
  mounted () {
    const isInstance = !!this.instance,
      isInstanceGroup = !isInstance,
      isInstanceWithClickEvent = isInstance && !!this.instance.clickEvent,
      needsClickEvent =
        (isInstanceGroup && !this.entity.clickEvent) ||
        (isInstance && !this.instance.clickEvent),
      entityHasClickEvent = this.entity && !!this.entity.clickEvent

    this.synced =
      isInstance && isInstanceWithClickEvent && this.instance.clickEvent.synced

    if (this.synced) {
      this.clickEvent = this.instance.clickEvent
      this.displayedClickEvent = { ...this.entity.clickEvent, synced: true }
    } else if (isInstanceWithClickEvent) {
      this.clickEvent = this.instance.clickEvent
      this.displayedClickEvent = { ...this.instance.clickEvent }
    } else if (isInstance && entityHasClickEvent) {
      this.clickEvent = this.entity.clickEvent
      this.displayedClickEvent = { ...this.entity.clickEvent, synced: true }
    } else if (!isInstance && entityHasClickEvent) {
      this.clickEvent = this.entity.clickEvent
      this.displayedClickEvent = { ...this.entity.clickEvent }
    } else if (needsClickEvent) {
      this.clickEvent = new ClickEvent()
      this.displayedClickEvent = this.clickEvent
    }

    this.originalClickEvent = { ...this.displayedClickEvent }
  },
  computed: {
    show: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('input', value)
      }
    }
  },
  methods: {
    save () {
      this.show = false
      if (this.instance && this.instance.synced) {
        const i = this.entity.instances.findIndex(
          instance => instance.id == this.instance.id
        )
        Vue.set(this.entity.instances[i], 'clickEvent', this.originalClickEvent)
      }
    },
    revert () {
      this.show = false
      if (this.instance) {
        const i = this.entity.instances.findIndex(
          instance => instance.id == this.instance.id
        )
        Vue.set(this.entity.instances[i], 'clickEvent', this.originalClickEvent)
      } else {
        Vue.set(this.entity, 'clickEvent', this.originalClickEvent)
      }
      Vue.nextTick(() => {
        this.$emit('onChange')
      })
    },
    changeType () {
      if (this.displayedClickEvent.type == this.EClickEventType.TRACKING_ONLY) {
        this.displayedClickEvent.hasTracking = true
      }
      this.hasErrors = false
      this.setClickTrackingId()
      this.changeValue()
    },
    changeValue () {
      if (this.instance) {
        const i = this.entity.instances.findIndex(
          instance => instance.id == this.instance.id
        )
        Vue.set(
          this.entity.instances[i],
          'clickEvent',
          this.displayedClickEvent
        )
      } else {
        Vue.set(this.entity, 'clickEvent', this.displayedClickEvent)
      }
      Vue.nextTick(() => {
        if (this.hasErrors) {
          return
        }
        this.$emit('onChange')
      })
    },
    toggleHoverText (value) {
      Vue.set(this.displayedClickEvent, 'showFeedback', value)
      if (!value) {
        this.hasErrors = false
      }
      this.changeValue()
    },
    toggleTracking (value) {
      if (!value) {
        this.hasErrors = false
      } else {
        this.setClickTrackingId()
      }
      this.changeValue()
    },
    toggleSync (value) {
      if (value) {
        this.displayedClickEvent = { ...this.entity.clickEvent, synced: true }
      }
      this.changeValue()
    },
    setClickTrackingId () {
      let clickTrackingId
      let defaultTrackingName

      if (this.instance) {
        defaultTrackingName =
          this.instance.customId || this.instance.name || this.entity.name
      } else {
        defaultTrackingName = this.entity.customId || this.entity.name
      }

      if (
        this.displayedClickEvent.trackingId ||
        this.displayedClickEvent.type == this.EClickEventType.NONE
      ) {
        //do nothing
      } else if (
        this.displayedClickEvent.type == this.EClickEventType.EXTERNAL
      ) {
        clickTrackingId = `click-event-(external-link)-${this.clickEvent
          .externalLink || defaultTrackingName}`
      } else if (
        this.displayedClickEvent.type == this.EClickEventType.TRACKING_ONLY
      ) {
        clickTrackingId = `click-event-${this.clickEvent.sound ||
          defaultTrackingName}`
      } else if (this.displayedClickEvent.type == this.EClickEventType.SOUND) {
        clickTrackingId = `click-event-(play-sound)-${this.clickEvent.sound ||
          defaultTrackingName}`
      } else if (this.displayedClickEvent.type == this.EClickEventType.STREAM) {
        clickTrackingId = `click-event-(play-stream)-${defaultTrackingName}`
      } else if (this.displayedClickEvent.type == this.EClickEventType.MOVE) {
        clickTrackingId = `click-event-(move-player)-${defaultTrackingName}`
      } else if (
        this.displayedClickEvent.type == this.EClickEventType.TELEPORT
      ) {
        clickTrackingId = `click-event-(teleport-player)-${this.clickEvent
          .teleportTo || defaultTrackingName}`
      }

      if (clickTrackingId) {
        this.displayedClickEvent.trackingId = clickTrackingId
        this.changeValue()
      }
    },
    validateExternalLink (value) {
      if (!value) {
        this.hasErrors = true
        return 'Enter a website URL'
      } else if (value.includes('https://')) {
        this.hasErrors = false
        return true
      } else {
        this.hasErrors = true
        return 'Must use https:// links'
      }
    },
    validateHoverText (value) {
      if (!value) {
        this.hasErrors = true
        return 'Enter text or disable toggle'
      } else {
        this.hasErrors = false
        return true
      }
    },
    validateTrackingId (value) {
      if (!value) {
        this.hasErrors = true
        return 'Enter text or disable toggle'
      } else {
        this.hasErrors = false
        return true
      }
    }
  }
}
</script>
