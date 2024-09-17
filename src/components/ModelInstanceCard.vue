<template>
  <div>
    <div class="d-flex ma-0 pa-3 align-center grey" :class="i % 2 ? 'darken-3' : 'darken-4'">
      <span class="grey--text flex-shrink-1 flex-grow-0 pr-1">
        <v-btn icon @click.stop="toggleVisibility()" :disabled="model.customRendering || instance.customRendering">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on" :class="model.enabled && instance.enabled ? '' : 'red--text'">
                {{ model.enabled && instance.enabled ? 'mdi-eye' : 'mdi-eye-off' }}
              </v-icon>
            </template>
            <span>{{ localeAction('show/hide') }}</span>
          </v-tooltip>
        </v-btn></span
      >
      <div class="d-inline-flex align-center pa-0 ma-0" v-if="editingName">
        <v-text-field hide-details v-model="instance.name" label="Rename Instance"></v-text-field>
        <v-btn small icon @click="editInstanceName()">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon small v-bind="attrs" v-on="on"> mdi-content-save </v-icon>
            </template>
            <span>Save</span>
          </v-tooltip>
        </v-btn>
        <v-btn small icon @click="cancelEditInstanceName()">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon small v-bind="attrs" v-on="on"> mdi-close </v-icon>
            </template>
            <span>Cancel</span>
          </v-tooltip>
        </v-btn>
      </div>
      <div v-if="!editingName" class="flex-grow-1">{{ instance.name }}</div>
      <div v-if="!editingName" class="d-flex align-center">
        <div>
          <v-btn small icon @click="showRenameField()">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon small v-bind="attrs" v-on="on"> mdi-rename </v-icon>
              </template>
              <span>{{ localeAction('rename') }}</span>
            </v-tooltip>
          </v-btn>
        </div>
        <div>
          <v-btn small icon @click="addInstance(instance)">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon small v-bind="attrs" v-on="on"> mdi-content-duplicate </v-icon>
              </template>

              <span>{{ localeAction('duplicate') }}</span>
            </v-tooltip>
          </v-btn>
        </div>
        <div>
          <v-btn
            small
            icon
            @click.stop="
              showDeleteDialog({
                title: localeText('Model Instance'),
                element: 'model',
                elementData: model,
                instance: true,
                instanceData: instance,
              })
            "
          >
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon small v-bind="attrs" v-on="on"> mdi-trash-can </v-icon>
              </template>
              <span>{{ localeAction('remove') }}</span>
            </v-tooltip>
          </v-btn>
        </div>
      </div>
    </div>
    <quick-view v-if="model?.showDetails" :instance="instance" class="grey px-3" :class="i % 2 ? 'darken-3' : 'darken-4'" />
    <div class="d-flex pb-3 flex-row justify-space-around grey" :class="i % 2 ? 'darken-3' : 'darken-4'">
      <v-btn
        icon
        @click.stop="
          showTransformDialog({
            element: 'model',
            elementData: model,
            instance: true,
            instanceData: instance,
          })
        "
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on"> mdi-axis-arrow </v-icon>
          </template>
          <span> {{ localeAction('transform') }}</span>
        </v-tooltip>
      </v-btn>
      <v-btn
        icon
        @click="
          showClickEventDialog({
            title: localeText('Model Instance'),
            element: 'model',
            elementData: model,
            instance: true,
            instanceData: instance,
          })
        "
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on"> mdi-mouse </v-icon>
          </template>
          <span>{{ localeAction('click action') }}</span>
        </v-tooltip>
      </v-btn>
      <v-btn
        icon
        @click.stop="
          showPropertiesDialog({
            title: localeText('Model Instance'),
            element: 'model',
            elementData: model,
            instance: true,
            instanceData: instance,
          })
        "
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on"> mdi-tune </v-icon>
          </template>
          <span>{{ localeText('Instance Properties') }}</span>
        </v-tooltip>
      </v-btn>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { SceneModelInstance } from '../models/SceneModelInstance'
import QuickView from './QuickView.vue'
import { mapActions, mapGetters } from 'vuex'
import { SceneModel } from '../models/SceneModel'

export default {
  components: { QuickView },
  name: 'ModelInstanceCard',
  props: {
    i: Number,
    instance: {
      type: Object,
      default: function () {
        return new SceneModelInstance()
      },
    },
    model: {
      type: Object,
      default: function () {
        return new SceneModel()
      },
    },
  },
  data: () => ({
    editingName: false,
  }),
  computed: {
    ...mapGetters({
      localeAction: 'i18n/actions',
      localeText: 'i18n/models',
    }),
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
      updateSceneElement: 'scene/updateSceneElement',
      deleteSceneElement: 'scene/deleteSceneElement',
      showTransformDialog: 'dialog/showTransformDialog',
      showPropertiesDialog: 'dialog/showPropertiesDialog',
      showClickEventDialog: 'dialog/showClickEventDialog',
      showDeleteDialog: 'dialog/showDeleteDialog',
    }),
    showRenameField() {
      this.editingName = true
      this.originalName = this.instance.name
    },
    removeModelInstance() {
      const instanceData = { ...this.model.instances[this.i] }
      Vue.delete(this.model.instances, this.i)

      this.deleteSceneElement({
        element: 'model',
        instance: true,
        id: instanceData.id,
        materialId: this.model.id,
        elementData: this.model,
        instanceData,
      })
    },
    cancelEditInstanceName() {
      this.editingName = false
      this.instance.name = this.originalName
    },
    editInstanceName() {
      if (!this.instance.name) {
        return this.cancelEditInstanceName()
      }
      this.editingName = false
      this.updateSceneElement({
        element: 'model',
        instance: true,
        property: 'name',
        id: this.instance.sk,
        elementData: this.model,
        instanceData: this.instance,
      })
    },
    toggleVisibility() {
      Vue.set(this.instance, 'enabled', !this.instance.enabled)
      this.updateSceneElement({
        element: 'model',
        instance: true,
        property: 'enabled',
        id: this.instance.sk,
        elementData: this.model,
        instanceData: this.instance,
      })
    },
    updateInstanceClickEvent() {
      this.updateSceneElement({
        element: 'model',
        instance: true,
        property: 'clickEvent',
        id: this.instance.sk,
        elementData: this.model,
        instanceData: this.instance,
      })
    },
    updateInstanceProperties() {
      this.updateSceneElement({
        element: 'model',
        instance: true,
        property: 'properties',
        id: this.instance.sk,
        elementData: this.model,
        instanceData: this.instance,
      })
    },
    updateInstanceTransform() {
      this.updateSceneElement({
        element: 'model',
        instance: true,
        property: 'transform',
        custom: this.instance.customRendering,
        id: this.instance.sk,
        elementData: this.model,
        instanceData: this.instance,
      })
    },
    addInstance(instance) {
      this.$emit('addInstance', instance)
    },
  },
}
</script>

<style lang="scss" scoped>
.row-label {
  font-size: 0.5em;
  text-transform: uppercase;
  font-weight: bold;
}
</style>
