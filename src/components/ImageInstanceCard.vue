<template>
  <div>
    <div class="d-flex ma-0 pa-3 align-center grey" :class="i % 2 ? 'darken-3' : 'darken-4'">
      <!-- <span class="grey--text flex-shrink-1 flex-grow-0 pr-1">{{ i + 1 }}</span> -->
      <span class="grey--text flex-shrink-1 flex-grow-0 pr-1">
        <v-btn icon @click.stop="toggleVisibility()" :disabled="image.customRendering || instance.customRendering">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on" :class="image.enabled && instance.enabled ? '' : 'red--text'">
                {{ image.enabled && instance.enabled ? 'mdi-eye' : 'mdi-eye-off' }}
              </v-icon>
            </template>
            <span>{{ image.enabled && instance.enabled ? localeTooltip('Hide') : localeTooltip('Show') }}</span>
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
            <span>{{ localeAction('save') }}</span>
          </v-tooltip>
        </v-btn>
        <v-btn small icon @click="cancelEditInstanceName()">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon small v-bind="attrs" v-on="on"> mdi-close </v-icon>
            </template>
            <span>{{ localeAction('cancel') }}</span>
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

              <span>{{ localeTooltip('Duplicate') }}</span>
            </v-tooltip>
          </v-btn>
        </div>
        <div>
          <v-btn
            small
            icon
            @click.stop="
              showDeleteDialog({
                title: localeText('Image Instance'),
                element: 'image',
                elementData: image,
                instance: true,
                instanceData: instance,
              })
            "
          >
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon small v-bind="attrs" v-on="on"> mdi-trash-can </v-icon>
              </template>
              <span>{{ localeTooltip('Remove') }}</span>
            </v-tooltip>
          </v-btn>
        </div>
      </div>
    </div>
    <quick-view v-if="image.showDetails" :instance="instance" class="grey px-3" :class="i % 2 ? 'darken-3' : 'darken-4'" />
    <div class="d-flex pb-3 flex-row justify-space-around grey" :class="i % 2 ? 'darken-3' : 'darken-4'">
      <v-btn
        icon
        @click.stop="
          showTransformDialog({
            element: 'image',
            elementData: image,
            instance: true,
            instanceData: instance,
          })
        "
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on"> mdi-axis-arrow </v-icon>
          </template>
          <span>{{ localeTooltip('Transform') }}</span>
        </v-tooltip>
      </v-btn>
      <v-btn
        icon
        @click="
          showClickEventDialog({
            title: localeText('Image Instance'),
            element: 'image',
            elementData: image,
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
            title: 'Image Instance',
            element: 'image',
            elementData: image,
            instance: true,
            instanceData: instance,
          })
        "
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on"> mdi-tune </v-icon>
          </template>
          <span>{{ localeTooltip('Instance Properties') }}</span>
        </v-tooltip>
      </v-btn>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { SceneImage } from '../models/SceneImage'
import { SceneImageInstance } from '../models/SceneImageInstance'
import QuickView from './QuickView.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  components: { QuickView },
  name: 'ImageInstanceCard',
  props: {
    i: Number,
    instance: {
      type: Object,
      default: function () {
        return new SceneImageInstance()
      },
    },
    image: {
      type: Object,
      default: function () {
        return new SceneImage()
      },
    },
  },
  data: () => ({
    editingName: false,
  }),
  computed: {
    ...mapGetters({
      localeAction: 'i18n/actions',
      localeTooltip: 'i18n/tooltips',
    }),
    truncatedName() {
      const imageNameArr = this.image && this.image.name.split('')
      let noSpacesLength = 0
      let truncated = this.image.name
      imageNameArr.forEach((char) => {
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

      if (truncated !== this.image.name) {
        return `...${truncated}`
      } else {
        return this.image.name
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
    removeImageInstance() {
      const instanceData = { ...this.image.instances[this.i] }
      Vue.delete(this.image.instances, this.i)

      this.deleteSceneElement({
        element: 'image',
        instance: true,
        id: instanceData.id,
        materialId: this.image.id,
        elementData: this.image,
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
        element: 'image',
        instance: true,
        property: 'name',
        id: this.instance.sk,
        elementData: this.image,
        instanceData: this.instance,
      })
    },
    toggleVisibility() {
      Vue.set(this.instance, 'enabled', !this.instance.enabled)
      this.updateSceneElement({
        element: 'image',
        instance: true,
        property: 'enabled',
        id: this.instance.sk,
        elementData: this.image,
        instanceData: this.instance,
      })
    },
    updateInstanceClickEvent() {
      this.updateSceneElement({
        element: 'image',
        instance: true,
        property: 'clickEvent',
        id: this.instance.sk,
        elementData: this.image,
        instanceData: this.instance,
      })
    },
    updateInstanceProperties() {
      this.updateSceneElement({
        element: 'image',
        instance: true,
        property: 'properties',
        id: this.instance.sk,
        elementData: this.image,
        instanceData: this.instance,
      })
    },
    updateInstanceTransform() {
      this.updateSceneElement({
        element: 'image',
        instance: true,
        property: 'transform',
        custom: this.instance.customRendering,
        id: this.instance.sk,
        elementData: this.image,
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
