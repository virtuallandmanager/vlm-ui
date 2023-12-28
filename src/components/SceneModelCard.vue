<template>
  <div>
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
            label="Model Name"
            v-model="model.name"
            hide-details="auto"
            append-outer-icon="mdi-content-save"
            @click:append-outer="toggleEditMode()"
            @blur="toggleEditMode()"
            dense
            @change="editModelName()"
          ></v-text-field>
        </div>
      </div>
      <div class="d-flex justify-end align-center black dark pa-1">
        <v-btn icon dark @click="toggleVisibility()" :disabled="model.customRendering">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on" :class="model.enabled ? '' : 'red--text'">
                {{ model.enabled ? 'mdi-eye' : 'mdi-eye-off' }}
              </v-icon>
            </template>
            <span>Show/Hide All</span>
          </v-tooltip>
        </v-btn>
        <v-btn
          icon
          dark
          @click.stop="
            showClickEventDialog({
              element: 'model',
              elementData: model,
            })
          "
        >
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on"> mdi-mouse </v-icon>
            </template>
            <span>Default Click Action</span>
          </v-tooltip>
        </v-btn>
        <v-btn
          icon
          dark
          @click.stop="
            showPropertiesDialog({
              element: 'model',
              elementData: model,
            })
          "
        >
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on"> mdi-tune </v-icon>
            </template>
            <span>Model Properties</span>
          </v-tooltip>
        </v-btn>
        <v-btn
          icon
          dark
          @click.stop="
            showDeleteDialog({
              element: 'model',
              elementData: model,
            })
          "
        >
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on"> mdi-trash-can </v-icon>
            </template>
            <span>Remove Model</span>
          </v-tooltip>
        </v-btn>
      </div>
      <div class="px-2 pt-2">
        <v-text-field
          outlined
          dark
          label="Model File"
          v-model="model.modelSrc"
          :error-messages="errors"
          @input="validateInput"
          @change="updateModelSrc()"
          persistent-hint
          hint="Model files must exist in your project."
        ></v-text-field>
      </div>
      <div>
        <div class="d-flex justify-start align-center grey darken-2 pa-4">
          <h1 class="text-body-1 font-weight-bold flex-grow-1" dark>Instances</h1>
          <v-btn small @click="addInstance()" class="flex-shrink-1"><v-icon small>mdi-plus</v-icon> Add Instance</v-btn>
        </div>
        <div class="d-flex justify-end align-center px-3" v-if="model.instances.length">
          <v-switch v-model="model.showDetails" class="flex-shrink-1 pa-0" label="Detailed" />
        </div>
        <div class="d-flex flex-column pa-4" v-if="!model.instances.length">
          <div class="text-body-1 text-center">Add an instance for this model to see it in the scene.</div>
        </div>
        <div class="d-flex flex-column my-0" v-if="model.instances.length">
          <div v-for="(instance, i) in model.instances" :key="i">
            <model-instance-card :instance="instance" :model="model" :i="i" @addInstance="addInstance" />
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapActions } from 'vuex'
import ModelInstanceCard from './ModelInstanceCard'
import { SceneModel } from '../models/SceneModel'
import { SceneModelInstance } from '../models/SceneModelInstance'

export default {
  components: {
    ModelInstanceCard,
  },
  name: 'SceneModelCard',
  props: {
    property: Object,
    i: Number,
    model: {
      type: Object,
      default: function () {
        return new SceneModel()
      },
    },
  },
  data: () => ({
    dialogCallback: () => {},
    errors: [],
    replaceModelDialog: false,
    externalUrlDialog: false,
    selectedModel: null,
    selectedInstance: null,
    editingName: false,
    newModelSrc: '',
    clickEvents: [
      { text: 'None', value: 0, default: true },
      { text: 'Website Link', value: 1 },
      { text: 'Play Sound (Coming Soon)', value: 2, disabled: true },
      { text: 'Move Player in Scene (Coming Soon)', value: 3, disabled: true },
      { text: 'Teleport Player (Coming Soon)', value: 4, disabled: true },
    ],
  }),
  mounted() {
    this.selectedModel = this.model
  },
  computed: {
    modelSrc() {
      return this.model.thumbnailSrc ? this.model.thumbnailSrc : this.model.modelSrc
    },
    truncatedName() {
      const modelNameArr = this.model && this.model.name.split('')
      let noSpacesLength = 0
      let truncated = this.model.name
      modelNameArr.forEach((char) => {
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

      if (truncated !== this.model.name) {
        return `...${truncated}`
      } else {
        return this.model.name
      }
    },
  },
  methods: {
    ...mapActions({
      showTransformDialog: 'dialog/showTransformDialog',
      showPropertiesDialog: 'dialog/showPropertiesDialog',
      showClickEventDialog: 'dialog/showClickEventDialog',
      showDeleteDialog: 'dialog/showDeleteDialog',
      createSceneElement: 'scene/createSceneElement',
      updateSceneElement: 'scene/updateSceneElement',
      deleteSceneElement: 'scene/deleteSceneElement',
    }),
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
    toggleEditMode() {
      this.editingName = !this.editingName
    },
    toggleDetails() {
      Vue.set(this.model, 'showDetails', !this.model.showDetails)
    },
    removeModel() {
      this.deleteDialog = false
      this.$emit('onRemove')
    },
    validateInput() {
      this.errors = []
      const forbiddenSubstrings = ['http://', 'https://', 'www.']
      forbiddenSubstrings.forEach((substring) => {
        if (this.model.modelSrc.includes(substring)) {
          this.errors.push('Unfortunately Decentraland does not support externally hosted models.')
        }
      })
    },
    addInstance(duplicate) {
      const newInstance = new SceneModelInstance()
      newInstance.name = `Instance ${this.model.instances.length + 1}`
      newInstance.clickEvent = { ...this.model.clickEvent, synced: true }

      if (duplicate) {
        newInstance.enabled = !!duplicate.enabled
        newInstance.position = { ...duplicate.position }
        newInstance.scale = { ...duplicate.scale }
        newInstance.rotation = { ...duplicate.rotation }
        newInstance.name = `${duplicate.name} (Copy)`
        newInstance.clickEvent = { ...duplicate.clickEvent }
      }

      this.createSceneElement({
        element: 'model',
        instance: true,
        id: newInstance.sk,
        elementData: this.model,
        instanceData: newInstance,
      })
    },
    editInstanceName(instance) {
      this.updateSceneElement({
        element: 'model',
        instance: true,
        property: 'name',
        id: instance.sk,
        elementData: this.model,
        instanceData: instance,
      })
    },
    editModelName() {
      this.updateSceneElement({
        element: 'model',
        property: 'name',
        id: this.model.sk,
        elementData: this.model,
      })
    },
    saveModelProperties() {
      this.closePropertiesDialog()
    },
    updateModelSrc() {
      this.updateSceneElement({
        element: 'model',
        property: 'modelSrc',
        id: this.model.sk,
        elementData: this.model,
      })
    },
    toggleVisibility() {
      Vue.set(this.model, 'enabled', !this.model.enabled)
      this.updateSceneElement({
        element: 'model',
        property: 'enabled',
        id: this.model.sk,
        elementData: this.model,
      })
    },
    updateModelClickEvent() {
      this.updateSceneElement({
        element: 'model',
        property: 'clickEvent',
        id: this.model.sk,
        elementData: this.model,
      })
    },
    updateModelProperties() {
      this.updateSceneElement({
        element: 'model',
        property: 'properties',
        id: this.model.sk,
        elementData: this.model,
      })
    },
    updateInstanceProperties(instance) {
      this.updateSceneElement({
        element: 'model',
        property: 'properties',
        instance: true,
        id: instance.sk,
        elementData: this.model,
        instanceData: instance,
      })
    },
    resetDialogs() {
      this.replaceModelDialog = false
      this.externalUrlDialog = false
    },
    selectModel() {
      this.$refs.fileInput.click()
    },
  },
}
</script>
