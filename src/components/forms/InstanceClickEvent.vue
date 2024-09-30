<template>
  <v-card>
    <v-card-title>{{ localeAction('click action') }}</v-card-title>
    <v-card-subtitle>{{ elementData.name.capitalize() }}</v-card-subtitle>
    <v-divider></v-divider>
    <v-card-subtitle class="pa-6 d-flex flex-column">
      <v-switch
        v-model="synced"
        dense
        :true-value="false"
        :false-value="true"
        :label="localeText('Override Default Click Action')"
        @change="toggleSync"
      >
      </v-switch>
      <div v-if="synced" class="text-caption">
        <v-icon small>mdi-information-outline</v-icon>
        {{ instanceUsesDefaultText }}
      </div>
      <div v-if="!synced && !formState.matchesDefault" class="text-caption">
        <v-icon small>mdi-information-outline</v-icon>
        {{ localeText('InstanceIsUniqueText') }}
      </div>
      <div v-if="!synced && formState.matchesDefault" class="text-caption">
        <v-icon small>mdi-information-outline</v-icon>
        {{ instanceMatchesDefaultText }}
      </div>
      <v-btn v-if="!synced && !formState.matchesDefault" small class="mt-4 align-self-center" @click="restoreDefaults">
        <v-icon small class="mr-1">mdi-restore</v-icon> {{ restoreDefaultsText }}
      </v-btn>
    </v-card-subtitle>
    <v-divider></v-divider>
    <v-card-text>
      <v-select
        v-model="displayedClickEvent.type"
        :label="localeText('Click Behavior')"
        :items="clickEvents"
        class="mt-4"
        @change="changeType"
        :disabled="synced"
      ></v-select>
      <v-text-field
        v-if="displayedClickEvent && displayedClickEvent.type == this.EClickEventType.EXTERNAL"
        v-model="displayedClickEvent.externalLink"
        :label="localeText('External Link')"
        :rules="[validateExternalLink]"
        dense
        @change="changeValue"
        :disabled="synced"
      ></v-text-field>
      <v-text-field
        v-if="displayedClickEvent && displayedClickEvent.type == this.EClickEventType.SOUND"
        v-model="displayedClickEvent.sound"
        :label="localeText('Audio File')"
        dense
        @change="changeValue"
        :disabled="synced"
      ></v-text-field>
      <div v-if="displayedClickEvent && displayedClickEvent.type == this.EClickEventType.MOVE">
        <div class="display-caption">{{ localeText('Position') }}</div>
        <div class="d-inline-flex align-content-space-between coords">
          <v-text-field
            v-model="displayedClickEvent.moveTo.position.x"
            label="X"
            @change="changeMoveTo"
            :disabled="synced"
            type="number"
          ></v-text-field>
          <v-text-field
            v-model="displayedClickEvent.moveTo.position.y"
            label="Y"
            @change="changeMoveTo"
            :disabled="synced"
            type="number"
          ></v-text-field>
          <v-text-field
            v-model="displayedClickEvent.moveTo.position.z"
            label="Z"
            @change="changeMoveTo"
            :disabled="synced"
            type="number"
          ></v-text-field>
        </div>
        <v-switch
          v-if="displayedClickEvent && displayedClickEvent.type !== EClickEventType.NONE"
          v-model="displayedClickEvent.moveTo.setCameraTarget"
          :label="localeText('Set New Camera Target')"
          @change="toggleSetCameraTarget"
          :disabled="synced"
        ></v-switch>
        <div v-if="displayedClickEvent && displayedClickEvent.moveTo && displayedClickEvent.moveTo.setCameraTarget">
          <div class="display-caption">{{ localeText('Camera Target') }}</div>
          <div class="d-inline-flex align-content-space-between coords">
            <v-text-field
              v-model="displayedClickEvent.moveTo.cameraTarget.x"
              label="X"
              @change="changeMoveTo"
              :disabled="synced"
              type="number"
            ></v-text-field>
            <v-text-field
              v-model="displayedClickEvent.moveTo.cameraTarget.y"
              label="Y"
              @change="changeMoveTo"
              :disabled="synced"
              type="number"
            ></v-text-field>
            <v-text-field
              v-model="displayedClickEvent.moveTo.cameraTarget.z"
              label="Z"
              @change="changeMoveTo"
              :disabled="synced"
              type="number"
            ></v-text-field>
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
        :disabled="synced"
      ></v-text-field>
      <v-switch
        v-if="displayedClickEvent && displayedClickEvent.type > EClickEventType.NONE"
        v-model="displayedClickEvent.showFeedback"
        :label="localeText('Show Hover Text')"
        @change="toggleHoverText"
        :disabled="synced"
      ></v-switch>
      <v-text-field
        v-if="displayedClickEvent && displayedClickEvent.type > EClickEventType.NONE && displayedClickEvent.showFeedback"
        v-model="displayedClickEvent.hoverText"
        :label="localeText('Hover Text')"
        dense
        @change="changeValue"
        :rules="[validateHoverText]"
        :disabled="synced"
      ></v-text-field>
      <v-switch
        v-if="displayedClickEvent && displayedClickEvent.type !== EClickEventType.NONE"
        v-model="displayedClickEvent.hasTracking"
        :label="localeText('Track Click Event')"
        @change="toggleTracking"
        :disabled="synced"
      ></v-switch>
      <v-text-field
        v-if="displayedClickEvent && displayedClickEvent.type !== EClickEventType.NONE && displayedClickEvent.hasTracking"
        v-model="displayedClickEvent.trackingId"
        :label="localeText('Tracking ID')"
        dense
        @change="changeValue"
        :rules="[validateTrackingId]"
        :disabled="synced"
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
  name: 'InstanceClickEvent',
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
    synced: false,
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
    title: { type: String, default: 'Click Event' },
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
      default: 'Image',
    },
  },
  mounted() {
    this.defaultClickEvent = { ...this.elementData.clickEvent }
    this.clickEvent = { ...this.instanceData.clickEvent }
    this.originalClickEvent = { ...this.clickEvent }
    this.synced = this.clickEvent.synced
    this.displayedClickEvent = !this.synced ? { ...this.clickEvent, synced: false } : { ...this.defaultClickEvent, synced: true }
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
    restoreDefaultsText() {
      let localeText = this.localeText('RestoreDefaultsText')
      localeText = localeText.replace('{{ element }}', this.element.capitalize())
      return localeText
    },
    instanceUsesDefaultText() {
      let localeText = this.localeText('InstanceUsesDefaultText')
      localeText = localeText.replace('{{ element }}', this.element.capitalize())
      localeText = localeText.replace('{{ elementData.name }}', this.elementData.name)
      return localeText
    },
    instanceMatchesDefaultText() {
      let localeText = this.localeText('InstanceMatchesDefaultText')
      localeText = localeText.replace('{{ element }}', this.element.capitalize())
      localeText = localeText.replace('{{ elementData.name }}', this.elementData.name)
      return localeText
    },
    formState() {
      const displayedClickEvent = { ...this.displayedClickEvent },
        originalClickEvent = { ...this.originalClickEvent },
        defaultClickEvent = { ...this.elementData.clickEvent },
        matchesDefault = JSON.stringify(displayedClickEvent) === JSON.stringify(defaultClickEvent),
        matchesOriginal = JSON.stringify(displayedClickEvent) === JSON.stringify(originalClickEvent)

      console.log('displayedClickEvent', displayedClickEvent)
      console.log('defaultClickEvent', defaultClickEvent)
      console.log('originalClickEvent', originalClickEvent)
      console.log('matchesDefault', matchesDefault)
      console.log('matchesOriginal', matchesOriginal)

      delete displayedClickEvent.synced
      delete defaultClickEvent.synced
      delete originalClickEvent.synced
      return {
        matchesDefault,
        matchesOriginal,
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
      if (
        this.displayedClickEvent &&
        (!this.displayedClickEvent.moveTo || !this.displayedClickEvent.moveTo.position || !this.displayedClickEvent.moveTo.cameraTarget)
      ) {
        this.displayedClickEvent.moveTo = new ClickEvent().moveTo
      }
      this.hasErrors = false
      this.setClickTrackingId()
      this.changeValue()
    },
    changeValue() {
      if (this.displayedClickEvent.synced) {
        Vue.set(this.instanceData, 'clickEvent', this.displayedClickEvent)
      } else {
        Vue.set(this.instanceData, 'clickEvent', this.displayedClickEvent)
      }

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
    toggleSync() {
      if (this.synced) {
        this.displayedClickEvent = { ...this.defaultClickEvent, synced: true }
      } else {
        this.displayedClickEvent = { ...this.clickEvent, synced: false }
      }
      this.hasErrors = false
      this.changeValue()
    },
    restoreDefaults() {
      this.displayedClickEvent = {
        ...this.elementData.clickEvent,
      }
      this.hasErrors = false
      this.changeValue()
    },
    setClickTrackingId() {
      let clickTrackingId
      let defaultTrackingName = this.instanceData.customId || this.instanceData.name

      if (this.displayedClickEvent?.trackingId || this.displayedClickEvent?.type == this.EClickEventType.NONE) {
        //do nothing
      } else if (this.displayedClickEvent?.type == this.EClickEventType.EXTERNAL) {
        clickTrackingId = `click_event_(external_link)_${this.displayedClickEvent?.externalLink || defaultTrackingName}`
      } else if (this.displayedClickEvent?.type == this.EClickEventType.TRACKING_ONLY) {
        clickTrackingId = `click_event_${this.displayedClickEvent?.sound || defaultTrackingName}`
      } else if (this.displayedClickEvent.type == this.EClickEventType.SOUND) {
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
