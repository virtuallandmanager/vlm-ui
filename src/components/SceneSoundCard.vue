<template>
  <v-card elevation="6">
    <div class="d-flex justify-space-between align-center primary pa-4">
      <div class="text-h6" v-if="!editingName">
        {{ truncatedName }}
      </div>
      <v-tooltip v-if="!editingName" top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" class="d-flex-grow-0" icon small dark @click="toggleEditMode()" v-if="!editingName">
            <v-icon small>mdi-rename</v-icon>
          </v-btn>
        </template>
        <span>Rename</span>
      </v-tooltip>

      <div class="text-h5 flex-grow-1" v-if="editingName">
        <v-text-field
          autofocus
          outlined
          color="white"
          label="Sound Name"
          v-model="sound.name"
          hide-details="auto"
          append-outer-icon="mdi-content-save"
          @click:append-outer="toggleEditMode()"
          @blur="toggleEditMode()"
          dense
          @change="editSoundName()"
        />
      </div>
    </div>
    <div class="d-flex justify-end align-center black dark pa-2">
      <v-slider
        color="white"
        v-model="sound.volume"
        @change="updateVolume"
        max="1"
        min="0"
        step=".1"
        class="ma-0"
        dense
        hide-details="auto"
      ></v-slider>
      <v-btn icon dark @click="toggleVisibility()" :disabled="sound.customRendering">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on" :class="sound.enabled ? '' : 'red--text'">
              {{ sound.enabled ? 'mdi-volume-high' : 'mdi-volume-variant-off' }}
            </v-icon>
          </template>
          <span>Mute/Unmute All</span>
        </v-tooltip>
      </v-btn>
      <input style="display: none" ref="replaceFileInput" type="file" accept=".png,.jpg,.jpeg" @change="replaceSound(sound, i)" />
      <v-btn icon dark @click.stop="showPropertiesDialog({ element: 'sound', elementData: sound })">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on"> mdi-tune </v-icon>
          </template>
          <span>Sound Properties</span>
        </v-tooltip>
      </v-btn>
      <v-btn icon dark @click.stop="showDeleteDialog({ element: 'sound', elementData: sound })">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on"> mdi-trash-can </v-icon>
          </template>
          <span>Remove Sound</span>
        </v-tooltip>
      </v-btn>
    </div>
    <div class="d-block text-center pt-2">
      <v-select
        :items="soundTypes"
        v-model="sound.sourceType"
        @change="updateSourceType()"
        outlined
        class="ma-2 flex-grow-1 text-center"
        hide-details
      >
      </v-select>
    </div>
    <div class="px-2 pt-2">
      <v-text-field
        outlined
        dark
        label="Sound File"
        v-model="sound.audioSrc"
        :error-messages="errors"
        @input="validateInput"
        @change="updateAudioSrc()"
        :persistent-hint="sound.sourceType !== 3"
        hint="Sound files must exist in your project."
      ></v-text-field>
    </div>
    <div>
      <div class="d-flex justify-start align-center grey darken-2 pa-4">
        <h1 class="text-body-1 font-weight-bold flex-grow-1" dark>Instances</h1>
        <v-btn small @click="addInstance()" class="flex-shrink-1"><v-icon small>mdi-plus</v-icon> Add Instance</v-btn>
      </div>
      <div class="d-flex justify-space-between align-center px-3" v-if="sound.instances.length">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" icon class="flex-shrink-1 pa-0" @click="toggleLocators()"><v-icon>mdi-map-marker</v-icon></v-btn>
          </template>
          <span>Show Locators</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on" small color="primary">mdi-information</v-icon>
          </template>
          <span>Makes sounds visible only for you. (Beta)</span>
        </v-tooltip>
        <v-spacer />
        <v-switch v-model="sound.showDetails" class="flex-shrink-1 pa-0" label="Detailed" />
      </div>
      <div class="d-flex flex-column pa-4" v-if="!sound.instances.length">
        <div class="text-body-1 text-center">Add an instance for this sound to hear it in the scene.</div>
      </div>
      <div class="d-flex flex-column my-0" v-if="sound.instances.length">
        <div v-for="(instance, ii) in sound.instances" :key="ii">
          <sound-instance-card :instance="instance" :sound="sound" :i="ii" @updateSceneElement="updateSceneElement" @addInstance="addInstance" />
        </div>
      </div>
    </div>
  </v-card>
</template>

<script>
import Vue from 'vue'
import { mapActions } from 'vuex'
import SoundInstanceCard from './SoundInstanceCard'
import { SceneSound } from '../models/SceneSound'
import { SceneSoundInstance } from '../models/SceneSoundInstance'

export default {
  components: {
    SoundInstanceCard,
  },
  name: 'SceneSoundCard',
  props: {
    sound: {
      type: Object,
      default: function () {
        return new SceneSound()
      },
    },
  },
  data: () => ({
    dialogCallback: () => {},
    selectedSound: null,
    selectedInstance: null,
    editingName: false,
    soundTypes: [
      { text: 'Clip', value: 0 },
      { text: 'Loop', value: 1 },
      // {text: "Playlist",  value:3},
      // { text: "Stream", value: 4 },
    ],
    errors: [],
  }),
  mounted() {
    this.selectedSound = this.sound
    if (!this.sound.sourceType) {
      Vue.set(this.sound, 'sourceType', 0)
    }
  },
  computed: {
    truncatedName() {
      const soundNameArr = this.sound && this.sound.name.split('')
      let noSpacesLength = 0
      let truncated = this.sound.name
      soundNameArr.forEach((char) => {
        if (char !== ' ') {
          noSpacesLength++
        } else {
          noSpacesLength = 0
        }

        if (noSpacesLength > 18) {
          truncated = truncated.substr(truncated.length - 18)
          noSpacesLength = 0
        }
      })

      if (truncated !== this.sound.name) {
        return `...${truncated}`
      } else {
        return this.sound.name
      }
    },
  },
  methods: {
    ...mapActions({
      showPropertiesDialog: 'dialog/showPropertiesDialog',
      showDeleteDialog: 'dialog/showDeleteDialog',
      createSceneElement: 'scene/createSceneElement',
      updateSceneElement: 'scene/updateSceneElement',
      removeSceneElement: 'scene/removeSceneElement',
      toggleSoundLocators: 'scene/toggleSoundLocators',
    }),
    toggleEditMode() {
      this.editingName = !this.editingName
    },

    validateInput() {
      this.errors = []
      if (this.sound.sourceType == 0 || this.sound.sourceType == 1) {
        const forbiddenSubstrings = ['http://', 'https://', 'www.']
        forbiddenSubstrings.forEach((substring) => {
          if (this.sound.audioSrc.includes(substring)) {
            this.errors.push('Unfortunately Decentraland does not support externally hosted files.')
          }
        })
      }
    },

    toggleDetails() {
      Vue.set(this.sound, 'showDetails', !this.sound.showDetails)
    },
    removeSound() {
      this.deleteDialog = false
      this.$emit('onRemove')
    },
    removeSoundInstance(i) {
      const instanceData = this.sound.instances[i]
      Vue.delete(this.sound.instances, i)

      this.removeSceneElement({
        element: 'sound',
        instance: true,
        id: instanceData.id,
        materialId: this.sound.id,
        elementData: this.sound,
        instanceData,
      })
    },
    addInstance(duplicate) {
      const newInstance = new SceneSoundInstance()
      newInstance.name = `Instance ${this.sound.instances.length + 1}`
      newInstance.clickEvent = { ...this.sound.clickEvent, synced: true }

      if (duplicate) {
        newInstance.name = duplicate.name
        newInstance.enabled = !!duplicate.enabled
        newInstance.position = { ...duplicate.position }
        newInstance.scale = { ...duplicate.scale }
        newInstance.rotation = { ...duplicate.rotation }
        newInstance.clickEvent = { ...duplicate.clickEvent }
      }

      this.sound.instances.push(newInstance)
      this.createSceneElement({
        action: 'create',
        element: 'sound',
        instance: true,
        id: newInstance.id,
        elementData: this.sound,
        instanceData: newInstance,
      })
    },
    toggleLocators() {
      this.toggleSoundLocators({
        elementData: this.sound,
      })
    },
    editInstanceName(instance) {
      this.updateSceneElement({
        element: 'sound',
        instance: true,
        property: 'name',
        id: instance.id,
        elementData: this.sound,
        instanceData: instance,
      })
    },
    editSoundName() {
      this.updateSceneElement({
        element: 'sound',
        property: 'name',
        id: this.sound.sk,
        elementData: this.sound,
      })
    },
    updateAudioSrc() {
      this.updateSceneElement({
        element: 'sound',
        property: 'audioSrc',
        id: this.sound.sk,
        elementData: this.sound,
      })
    },
    updateSourceType() {
      this.updateSceneElement({
        element: 'sound',
        property: 'sourceType',
        id: this.sound.sk,
        elementData: this.sound,
      })
    },
    saveSoundProperties() {
      this.closePropertiesDialog()
    },
    updateVolume() {
      this.updateSceneElement({
        element: 'sound',
        property: 'volume',
        id: this.sound.sk,
        elementData: this.sound,
      })
    },
    toggleVisibility(instance) {
      if (instance) {
        Vue.set(instance, 'enabled', !instance.enabled)
        this.updateSceneElement({
          element: 'sound',
          instance: true,
          property: 'enabled',
          id: instance.id,
          elementData: this.sound,
          instanceData: instance,
        })
      } else {
        Vue.set(this.sound, 'enabled', !this.sound.enabled)
        this.updateSceneElement({
          element: 'sound',
          property: 'enabled',
          id: this.sound.id,
          elementData: this.sound,
        })
      }
    },
    updateSoundClickEvent() {
      this.updateSceneElement({
        element: 'sound',
        property: 'clickEvent',
        id: this.sound.id,
        elementData: this.sound,
      })
    },
    updateSoundProperties() {
      this.updateSceneElement({
        action: 'update',
        element: 'sound',
        property: 'properties',
        id: this.sound.id,
        elementData: this.sound,
      })
    },
    updateInstanceProperties(instance) {
      this.updateSceneElement({
        action: 'update',
        element: 'soundInstance',
        property: 'properties',
        id: instance.id,
        elementData: this.sound,
        instanceData: instance,
      })
    },
  },
}
</script>
