<template>
  <v-card>
    <v-card-title> {{ localeAction('default click action') }} </v-card-title>
    <v-card-subtitle>
      {{ element.capitalize() }}
    </v-card-subtitle>
    <v-divider></v-divider>
    <v-card-subtitle class="pa-6 d-flex flex-column">
      <div>
        <v-icon small>mdi-information-outline</v-icon>
        {{ localeText('DefaultClickActionDescription') }}
      </div>
    </v-card-subtitle>
    <v-divider></v-divider>
    <v-card-text>
      <!-- <div class="d-flex align-center justify-start"> -->
      <!-- </div> -->
      <v-select
        v-model="displayedClickEvent.type"
        :label="localeText('Click Behavior')"
        :items="clickEvents"
        class="mt-4"
        @change="changeType"
      ></v-select>
      <v-text-field
        v-if="displayedClickEvent && displayedClickEvent.type == this.EClickEventType.EXTERNAL"
        v-model="displayedClickEvent.externalLink"
        :label="localeText('External Link')"
        :rules="[validateExternalLink]"
        dense
        @change="changeValue"
      ></v-text-field>
      <v-text-field
        v-if="displayedClickEvent && displayedClickEvent.type == this.EClickEventType.SOUND"
        v-model="displayedClickEvent.sound"
        :label="localeText('Audio File')"
        dense
        @change="changeValue"
      ></v-text-field>
      <div v-if="displayedClickEvent && displayedClickEvent.type == this.EClickEventType.MOVE">
        <div class="display-caption">{{ localeText('Position') }}</div>
        <div class="d-inline-flex align-content-space-between coords">
          <v-text-field v-model="displayedClickEvent.moveTo.position.x" label="X" @change="changeMoveTo" type="number"></v-text-field>
          <v-text-field v-model="displayedClickEvent.moveTo.position.y" label="Y" @change="changeMoveTo" type="number"></v-text-field>
          <v-text-field v-model="displayedClickEvent.moveTo.position.z" label="Z" @change="changeMoveTo" type="number"></v-text-field>
        </div>
        <v-switch
          v-if="displayedClickEvent && displayedClickEvent.type !== EClickEventType.NONE"
          v-model="displayedClickEvent.moveTo.setCameraTarget"
          :label="localeText('Set New Camera Target')"
          @change="toggleSetCameraTarget"
        ></v-switch>
        <div v-if="displayedClickEvent && displayedClickEvent.moveTo && displayedClickEvent.moveTo.setCameraTarget">
          <div class="display-caption">{{ localeText('Camera Target') }}</div>
          <div class="d-inline-flex align-content-space-between coords">
            <v-text-field v-model="displayedClickEvent.moveTo.cameraTarget.x" label="X" @change="changeMoveTo" type="number"></v-text-field>
            <v-text-field v-model="displayedClickEvent.moveTo.cameraTarget.y" label="Y" @change="changeMoveTo" type="number"></v-text-field>
            <v-text-field v-model="displayedClickEvent.moveTo.cameraTarget.z" label="Z" @change="changeMoveTo" type="number"></v-text-field>
          </div>
        </div>
      </div>
      <v-text-field
        v-if="displayedClickEvent && displayedClickEvent.type == this.EClickEventType.TELEPORT"
        v-model="displayedClickEvent.teleportTo"
        :label="localeText('Destination Coordinates')"
        dense
        placeholder="0,0"
        @change="changeValue"
      ></v-text-field>
      <v-switch
        v-if="displayedClickEvent && displayedClickEvent.type > EClickEventType.NONE"
        v-model="displayedClickEvent.showFeedback"
        :label="localeText('Show Hover Text')"
        @change="toggleHoverText"
      ></v-switch>
      <v-text-field
        v-if="displayedClickEvent && displayedClickEvent.type > EClickEventType.NONE && displayedClickEvent.showFeedback"
        v-model="displayedClickEvent.hoverText"
        :label="localeText('Hover Text')"
        dense
        @change="changeValue"
        :rules="[validateHoverText]"
      ></v-text-field>
      <v-switch
        v-if="displayedClickEvent && displayedClickEvent.type !== EClickEventType.NONE"
        v-model="displayedClickEvent.hasTracking"
        :label="localeText('Track Click Event')"
        @change="toggleTracking"
      ></v-switch>
      <v-text-field
        v-if="displayedClickEvent && displayedClickEvent.type !== EClickEventType.NONE && displayedClickEvent.hasTracking"
        v-model="displayedClickEvent.trackingId"
        :label="localeText('Tracking ID')"
        dense
        @change="changeValue"
        :rules="[validateTrackingId]"
      ></v-text-field>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="accenttext" text @click="save"> {{ localeAction('save') }} </v-btn>
      <v-btn color="grey darken-1" text @click="revert"> {{ localeAction('cancel') }} </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import Vue from 'vue'
import { ClickEvent } from '../../models/ClickEvent'
import { mapGetters } from 'vuex'

export default {
  name: 'DefaultClickEvent',
  data: () => ({
    clickEvent: null,
    originalClickEvent: null,
    displayedClickEvent: new ClickEvent(),
    baseEntityType: '',
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
      { text: 'None', value: 0, default: true },
      { text: 'Tracking Only', value: 2 },
      { text: 'Website Link', value: 1 },
      { text: 'Play Sound', value: 3 },
      // { text: 'Play Audio Stream (Coming Soon)', value: this.EClickEventType.STREAM },
      { text: 'Move Player in Scene', value: 5 },
      { text: 'Teleport Player', value: 6 },
    ],
  }),
  props: {
    title: { type: String, default: 'Default Click Event' },
    elementData: {
      type: Object,
    },
    element: { type: String, default: 'element' },
    value: Boolean,
  },
  mounted() {
    this.displayedClickEvent = this.elementData?.clickEvent || new ClickEvent()
    this.originalClickEvent = { ...this.displayedClickEvent }
    this.clickEvents = this.clickEvents.map((event) => {
      event.text = this.localeText(event.text)
      return event
    })
  },
  computed: {
    ...mapGetters({
      localeText: 'i18n/clickActionDialog',
      localeAction: 'i18n/actions',
    }),
    formState() {
      const displayedClickEvent = { ...this.displayedClickEvent },
        originalClickEvent = { ...this.originalClickEvent }
      return {
        matchesOriginal: JSON.stringify(displayedClickEvent) === JSON.stringify(originalClickEvent),
      }
    },
  },
  methods: {
    save() {
      if (this.hasErrors) {
        return
      }
      this.$emit('onUpdate', this.displayedClickEvent, true)
    },
    revert() {
      this.$emit('onUpdate', this.originalClickEvent, true)
    },
    changeType() {
      if (this.displayedClickEvent.type == this.EClickEventType.TRACKING_ONLY) {
        this.displayedClickEvent.hasTracking = true
      }
      this.hasErrors = false
      this.setClickTrackingId()
      this.changeValue()
    },
    changeValue() {
      Vue.set(this.elementData, 'clickEvent', this.displayedClickEvent)

      Vue.nextTick(() => {
        if (this.hasErrors) {
          return
        }
        this.$emit('onUpdate', this.displayedClickEvent)
      })
    },
    toggleHoverText(value) {
      Vue.set(this.displayedClickEvent, 'showFeedback', value)
      if (!value) {
        this.hasErrors = false
      }
      this.changeValue()
    },
    toggleTracking(value) {
      if (!value) {
        this.hasErrors = false
      } else {
        this.setClickTrackingId()
      }
      this.changeValue()
    },
    toggleSetCameraTarget(value) {
      Vue.set(this.displayedClickEvent.moveTo, 'setCameraTarget', value)
      this.changeValue()
    },
    changeMoveTo() {
      Vue.set(this.displayedClickEvent.moveTo, 'position', this.displayedClickEvent.moveTo.position)
      Vue.set(this.displayedClickEvent.moveTo, 'cameraTarget', this.displayedClickEvent.moveTo.cameraTarget)
      Vue.set(this.displayedClickEvent.moveTo, 'setCameraTarget', this.displayedClickEvent.moveTo.setCameraTarget)
      this.changeValue()
    },
    setClickTrackingId() {
      let clickTrackingId
      let defaultTrackingName = this.elementData.customId || this.elementData.name

      if (this.displayedClickEvent?.trackingId || this.displayedClickEvent?.type == this.EClickEventType.NONE) {
        //do nothing
      } else if (this.displayedClickEvent?.type == this.EClickEventType.EXTERNAL) {
        clickTrackingId = `click_event_(external_link)_${this.displayedClickEvent?.externalLink || defaultTrackingName}`
      } else if (this.displayedClickEvent?.type == this.EClickEventType.TRACKING_ONLY) {
        clickTrackingId = `click_event_${this.displayedClickEvent?.sound || defaultTrackingName}`
      } else if (this.displayedClickEvent?.type == this.EClickEventType.SOUND) {
        clickTrackingId = `click_event_(play_sound)_${this.displayedClickEvent?.sound || defaultTrackingName}`
      } else if (this.displayedClickEvent?.type == this.EClickEventType.STREAM) {
        clickTrackingId = `click_event_(play_stream)_${defaultTrackingName}`
      } else if (this.displayedClickEvent?.type == this.EClickEventType.MOVE) {
        clickTrackingId = `click_event_(move_player)_${defaultTrackingName}`
      } else if (this.displayedClickEvent?.type == this.EClickEventType.TELEPORT) {
        clickTrackingId = `click_event_(teleport_player)_${this.displayedClickEvent?.teleportTo || defaultTrackingName}`
      }

      if (clickTrackingId) {
        this.displayedClickEvent.trackingId = clickTrackingId
        this.changeValue()
      }
    },
    validateExternalLink(value) {
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
    validateHoverText(value) {
      if (!value) {
        this.hasErrors = true
        return 'Enter text or disable toggle'
      } else {
        this.hasErrors = false
        return true
      }
    },
    validateTrackingId(value) {
      if (!value) {
        this.hasErrors = true
        return 'Enter text or disable toggle'
      } else {
        this.hasErrors = false
        return true
      }
    },
  },
}
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
