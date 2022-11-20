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
          v-model="clickEvent.type"
          label="Click Event"
          :items="clickEvents"
          class="mt-4"
          @change="changeType"
          :disabled="synced"
        ></v-select>
        <v-text-field
          v-if="clickEvent && clickEvent.type == 1"
          v-model="clickEvent.externalLink"
          label="External Link"
          :rules="[validateExternalLink]"
          dense
          @input="makeLowercase"
          @change="changeValue"
          :disabled="synced"
        ></v-text-field>
        <v-text-field
          v-if="clickEvent && clickEvent.type == 2"
          v-model="clickEvent.sound"
          label="Audio File"
          dense
          @change="changeValue"
          :disabled="synced"
        ></v-text-field>
        <v-text-field
          v-if="clickEvent && clickEvent.type == 3"
          v-model="clickEvent.moveTo"
          label="In-Scene Coordinates"
          dense
          @change="changeValue"
          :disabled="synced"
        ></v-text-field>
        <v-text-field
          v-if="clickEvent && clickEvent.type == 4"
          v-model="clickEvent.teleportTo"
          label="Destination Coordinates"
          dense
          @change="changeValue"
          :disabled="synced"
        ></v-text-field>
        <v-switch
          v-if="clickEvent && clickEvent.type > 0"
          v-model="clickEvent.showFeedback"
          label="Show Hover Text"
          @change="toggleHoverText"
          :disabled="synced"
        ></v-switch>
        <v-text-field
          v-if="clickEvent && clickEvent.type > 0 && clickEvent.showFeedback"
          v-model="clickEvent.hoverText"
          label="Hover Text"
          dense
          @change="changeValue"
          :rules="[validateHoverText]"
          :disabled="synced"
        ></v-text-field>
        <v-switch
          v-if="clickEvent && clickEvent.type > 0"
          v-model="clickEvent.hasTracking"
          label="Track Click Event"
          @change="toggleTracking"
          :disabled="synced"
        ></v-switch>
        <v-text-field
          v-if="clickEvent && clickEvent.type > 0 && clickEvent.hasTracking"
          v-model="clickEvent.trackingId"
          label="Tracking ID"
          dense
          @change="changeValue"
          :rules="[validateTrackingId]"
          :disabled="synced"
        ></v-text-field>
        <div v-if="instance && !synced">
          <v-icon small>mdi-alert</v-icon>
          This will override the click event of the base
          {{ entityType }}.
        </div>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-switch
          v-if="instance"
          v-model="synced"
          :label="synced ? 'Linked' : 'Unlinked'"
          @change="toggleSync"
        >
        </v-switch>
        <v-spacer></v-spacer>
        <v-btn
          color="accenttext"
          text
          @click="save"
          :disabled="(!instance && hasErrors) || (!synced && hasErrors)"
        >
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
    clickEvents: [
      { text: 'None', value: 0, default: true },
      { text: 'Website Link', value: 1 },
      { text: 'Play Sound (Coming Soon)', value: 2, disabled: true },
      { text: 'Move Player in Scene (Coming Soon)', value: 3, disabled: true },
      { text: 'Teleport Player (Coming Soon)', value: 4, disabled: true }
    ],
    clickEvent: { type: 0 },
    originalClickEvent: { type: 0 },
    baseEntityType: '',
    hasErrors: false,
    synced: false
  }),
  props: {
    title: { type: String, default: 'Click Event' },
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
    if (this.instance && !this.instance.clickEvent) {
      this.clickEvent = { ...this.entity.clickEvent }
    } else if (this.instance && this.instance.clickEvent) {
      this.clickEvent = { ...this.instance.clickEvent }
    } else if (this.entity.clickEvent) {
      this.clickEvent = { ...this.entity.clickEvent }
    } else {
      this.clickEvent = new ClickEvent()
    }
    if (
      this.instance &&
      (this.instance.clickEvent === null ||
        !Object.entries(this.instance.clickEvent).length)
    ) {
      this.originalClickEvent = { type: 0 }
    } else {
      this.originalClickEvent = { ...this.clickEvent }
    }

    this.synced = this.instance && this.instance.clickEvent == null
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
    },
    revert () {
      this.show = false
      if (this.instance) {
        const i = this.entity.instances.findIndex(
          instance => instance.id == this.instance.id
        )
        Vue.set(
          this.entity.instances[i],
          'clickEvent',
          this.synced ? this.originalClickEvent : null
        )
      } else {
        Vue.set(this.entity, 'clickEvent', this.originalClickEvent)
      }
      this.$emit('onChange')
    },
    toggleSync (value) {
      const i = this.entity.instances.findIndex(
        instance => instance.id == this.instance.id
      )

      if (value) {
        this.clickEvent = this.entity.clickEvent
      } else if (this.originalClickEvent && this.originalClickEvent.type > -1) {
        this.clickEvent = this.originalClickEvent
      } else {
        this.clickEvent = this.instance.clickEvent
      }

      Vue.set(this.entity.instances[i], 'clickEvent', this.clickEvent)
      this.$emit('onChange')
    },
    changeType () {
      this.hasErrors = false
      Vue.set(this.entity, 'clickEvent', this.clickEvent)
      this.setClickTrackingId()
      this.$emit('onChange')
    },
    changeValue () {
      if (this.instance) {
        const i = this.entity.instances.findIndex(
          instance => instance.id == this.instance.id
        )
        Vue.set(this.entity.instances[i], 'clickEvent', this.clickEvent)
      } else {
        Vue.set(this.entity, 'clickEvent', this.clickEvent)
      }
      this.$emit('onChange')
    },
    toggleHoverText (value) {
      Vue.set(this.clickEvent, 'showFeedback', value)
      if (!value) {
        this.hasErrors = false
      } else {
        this.validateHoverText(this.clickEvent.hoverText)
      }
      this.changeValue()
    },
    toggleTracking (value) {
      Vue.set(this.clickEvent, 'hasTracking', value)
      this.setClickTrackingId()
      if (!value) {
        this.hasErrors = false
      } else {
        this.validateTrackingId(this.clickEvent.trackingId)
      }
      this.changeValue()
    },
    makeLowercase (value) {
      Vue.set(this.entity.clickEvent, 'externalLink', value.toLowerCase())
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

      if (this.clickEvent.trackingId || this.clickEvent.type == 0) {
        //do nothing
      } else if (this.clickEvent.type == 1) {
        clickTrackingId = `click-event-(external-link)-${this.clickEvent
          .externalLink || defaultTrackingName}`
      } else if (this.clickEvent.type == 2) {
        clickTrackingId = `click-event-(play-sound)-${this.clickEvent.sound ||
          defaultTrackingName}`
      } else if (this.clickEvent.type == 3) {
        clickTrackingId = `click-event-(play-stream)-${defaultTrackingName}`
      } else if (this.clickEvent.type == 4) {
        clickTrackingId = `click-event-(move-player)-${defaultTrackingName}`
      } else if (this.clickEvent.type == 5) {
        clickTrackingId = `click-event-(teleport-player)-${this.clickEvent
          .teleportTo || defaultTrackingName}`
      }

      if (clickTrackingId) {
        Vue.set(this.clickEvent, 'trackingId', clickTrackingId)
      }
    },
    validateExternalLink (value) {
      if (!value) {
        this.hasErrors = true
        return 'Enter a website URL'
      } else if (value.includes('http://') || value.includes('https://')) {
        this.hasErrors = false
        return true
      } else {
        this.hasErrors = true
        return 'Must include http:// or https://'
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
