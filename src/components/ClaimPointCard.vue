<template>
  <div>
    <v-card elevation="6">
      <div class="d-flex justify-space-between align-center primary pa-4">
        <div class="text-h6" v-if="!editingName">
          {{ truncatedName }}
        </div>
        <v-tooltip v-if="!editingName" top>
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" class="d-flex-grow-0" icon small dark @click="toggleEditMode" v-if="!editingName">
              <v-icon small>mdi-rename</v-icon>
            </v-btn>
          </template>
          <span>{{ localeTooltip('Rename') }}</span>
        </v-tooltip>

        <div class="text-h5 flex-grow-1" v-if="editingName">
          <v-text-field
            autofocus
            outlined
            color="white"
            :label="localeText('Claim Point Name')"
            v-model="claimPoint.name"
            hide-details="auto"
            append-outer-icon="mdi-content-save"
            @click:append-outer="toggleEditMode"
            @blur="toggleEditMode"
            dense
            @change="editClaimPointName"
          ></v-text-field>
        </div>
      </div>
      <div class="d-flex ma-0 pa-3 align-center black">
        <span class="grey--text flex-shrink-1 flex-grow-0 pr-1">
          <v-btn icon @click.stop="toggleVisibility()" :disabled="claimPoint.customRendering">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon v-bind="attrs" v-on="on" :class="claimPoint.enabled ? '' : 'red--text'">
                  {{ claimPoint.enabled ? 'mdi-eye' : 'mdi-eye-off' }}
                </v-icon>
              </template>
              <span>{{ claimPoint.enabled ? localeTooltip('Hide') : localeTooltip('Show') }}</span>
            </v-tooltip>
          </v-btn></span
        >
        <span class="grey--text flex-shrink-1 flex-grow-0 pr-1">
          <v-btn
            icon
            @click.stop="
              showTransformDialog({
                element: 'claimpoint',
                elementData: claimPoint,
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
            dark
            @click.stop="
              showPropertiesDialog({
                element: 'claimpoint',
                elementData: claimPoint,
              })
            "
          >
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon v-bind="attrs" v-on="on"> mdi-tune </v-icon>
              </template>
              <span>{{ localeTooltip('Claim Point Properties') }}</span>
            </v-tooltip>
          </v-btn>
        </span>
        <v-spacer></v-spacer>
        <div>
          <v-btn
            icon
            @click.stop="
              showDeleteDialog({
                title: localeText('Giveaway Claim Point'),
                element: 'claimpoint',
                elementData: claimPoint,
              })
            "
          >
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon v-bind="attrs" v-on="on"> mdi-trash-can </v-icon>
              </template>
              <span>{{ localeAction('remove') }}</span>
            </v-tooltip>
          </v-btn>
        </div>
      </div>
      <div class="d-flex flex-column px-4 align-center">
        <v-switch
          v-model="properties.enableKiosk"
          :label="localeText('Show Kiosk')"
          class="ml-4 flex-grow-1"
          @change="updateClaimPointProperties"
        ></v-switch>
        <v-switch
          v-model="properties.showHoverText"
          :label="localeText('Show Hover Text')"
          class="ml-4 flex-grow-1"
          @change="updateClaimPointProperties"
        ></v-switch>
        <v-btn v-if="properties.enableKiosk" outlined color="secondary" @click="showColorPickerDialog">{{ localeText('Edit Kiosk Design') }}</v-btn>
      </div>
      <div class="d-flex px-4">
        <v-select
          v-model="properties.type"
          :items="claimPointTypes"
          :label="localeText('Claim Point Type')"
          outlined
          hide-details
          class="mt-4"
          @change="updateClaimPointProperties"
        ></v-select>
      </div>
      <div class="px-4">
        <v-text-field
          v-if="properties.type == 1"
          v-model="properties.imgSrc"
          :label="localeText('Image URL')"
          outlined
          hide-details
          class="mt-4"
          @change="updateClaimPointProperties"
        ></v-text-field>
        <v-text-field
          v-if="properties.type == 2"
          v-model="properties.modelSrc"
          :label="localeText('Model File Path')"
          outlined
          hide-details
          class="mt-4"
          @change="updateClaimPointProperties"
        ></v-text-field>
        <v-select
          v-if="properties.type == 3"
          :items="mannequinTypes"
          v-model="properties.mannequinType"
          :label="localeText('Mannequin Body Type')"
          outlined
          hide-details
          class="mt-4"
          @change="updateClaimPointProperties"
        ></v-select>
        <v-text-field
          v-if="properties.showHoverText"
          v-model="properties.hoverText"
          :label="localeText('Hover Text')"
          outlined
          hide-details
          class="mt-4"
          @change="updateClaimPointProperties"
        ></v-text-field>
      </div>
      <v-container>
        <v-row>
          <v-col :sm="itemColSize" v-for="item in giveaway?.items" :key="item.sk">
            <v-img :src="item.imageSrc"></v-img>
            <v-card class="text-caption text-center black pa-1">
              <div class="text-caption">{{ item.name }}</div>
              <div class="text-caption grey--text">{{ item.category?.capitalize() }}</div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
    <v-dialog v-model="colorPickerDialog" fullscreen>
      <v-card>
        <v-card-title>
          <span class="text-h6">{{ localeText('Kiosk Design') }}</span>
        </v-card-title>
        <v-card-text scrollable>
          <v-container>
            <v-row>
              <v-col sm="12">
                <div class="text-h6">{{ localeText('Customizations') }}</div>
                <v-text-field
                  v-model="properties.kioskImgSrc"
                  :label="localeText('Kiosk Image')"
                  :placeholder="localeText('Image Path/URL')"
                  persistent-placeholder
                  outlined
                  hide-details
                  class="mt-4"
                ></v-text-field>
                <v-slider
                  v-model="properties.itemYOffset"
                  :label="localeText('Item Height Offset')"
                  min="-3"
                  max="3"
                  step="0.01"
                  hide-details
                  class="mt-4"
                  @change="updateClaimPointProperties"
                ></v-slider>
                <v-slider
                  v-model="properties.itemScale"
                  :label="localeText('Item Scale')"
                  min="0"
                  max="5"
                  step="0.1"
                  hide-details
                  class="mt-4"
                  @change="updateClaimPointProperties"
                ></v-slider>
                <div class="d-flex justify-start">
                  <v-switch
                    v-model="properties.enableButton"
                    :label="localeText('Has A Button')"
                    @change="updateClaimPointProperties"
                    class="pr-4"
                  ></v-switch>
                  <v-switch v-model="properties.enableSpin" :label="localeText('Spin Item')" @change="updateClaimPointProperties"></v-switch>
                </div>
              </v-col>
            </v-row>
            <v-row>
              <v-col sm="6" class="d-flex justify-space-around">
                <div>
                  <div class="text-h6">{{ localeText('Base Color') }}</div>
                  <v-color-picker v-model="properties.color1" dot-size="25" hide-mode-switch mode="rgba"></v-color-picker>
                </div>
              </v-col>
              <v-col class="d-flex justify-space-around">
                <div>
                  <div class="text-h6">{{ localeText('Trim Color') }}</div>
                  <v-color-picker v-model="properties.color2" dot-size="25" hide-mode-switch mode="rgba"></v-color-picker>
                </div>
              </v-col>
              <v-col sm="6" class="d-flex justify-space-around">
                <div>
                  <div class="text-h6">{{ localeText('Glass Color') }}</div>
                  <v-color-picker v-model="properties.color3" dot-size="25" hide-mode-switch mode="rgba"></v-color-picker>
                </div>
              </v-col>
              <v-col sm="6" class="d-flex justify-space-around" v-if="properties.enableButton">
                <div>
                  <div class="text-h6">{{ localeText('Button Color') }}</div>
                  <v-color-picker v-model="properties.color4" dot-size="25" hide-mode-switch mode="rgba"></v-color-picker>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
          <v-btn color="primary" text @click="saveKiosk"> {{ localeAction('save') }} </v-btn>
          <v-btn color="grey" text @click="colorPickerDialog = false"> {{ localeAction('cancel') }} </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Vue from 'vue'
export default {
  name: 'ClaimPointCard',
  props: {
    claimPoint: Object,
  },
  data: () => ({
    editingName: false,
    colorPickerDialog: false,
    claimPointTypes: [
      // { text: "Marketplace Image", value: 0 },
      { text: 'Image', value: 1 },
      { text: '3D Model', value: 2 },
      // { text: "Mannequin", value: 3 }
    ],
    mannequinTypes: [
      { text: 'Male', value: 0 },
      { text: 'Female', value: 1 },
      { text: 'Match Player', value: 2 },
    ],
    color1: { r: 0, g: 0, b: 0, a: 1 },
    color2: { r: 0, g: 0, b: 0, a: 1 },
    color3: { r: 0, g: 0, b: 0, a: 1 },
    color4: { r: 0, g: 0, b: 0, a: 1 },
  }),
  computed: {
    ...mapGetters({
      activeScene: 'scene/activeScene',
      giveaways: 'giveaway/giveawayList',
      claimPoints: 'scene/sceneClaimPoints',
      localeText: 'i18n/claimPoints',
      localeAction: 'i18n/actions',
      localeTooltip: 'i18n/tooltips',
    }),
    giveaway() {
      return this.giveaways.find((g) => g.sk === this.claimPoint.giveawayId)
    },
    instance() {
      return this.claimPoint.instances[0]
    },
    properties() {
      return this.instance.properties
    },
    kioskItemPos() {
      return { x: 0, y: this.properties.itemYOffset || 0, z: 0 }
    },
    truncatedName() {
      const claimPointNameArr = this.claimPoint && this.claimPoint?.name?.split('')
      let noSpacesLength = 0
      let truncated = this.claimPoint?.name
      claimPointNameArr.forEach((char) => {
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

      if (truncated !== this.claimPoint?.name) {
        return `...${truncated}`
      } else {
        return this.claimPoint.name
      }
    },
    itemColSize() {
      const numItems = this.giveaway?.items.length
      if (numItems <= 2) {
        return 6
      } else if (numItems <= 4) {
        return 3
      } else {
        return 2
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
    changeKioskItemPos() {
      this.properties.itemYOffset = this.kioskItemPos.y
      this.updateClaimPointProperties()
    },
    toggleEditMode() {
      this.editingName = true
    },
    showColorPickerDialog() {
      this.colorPickerDialog = true
    },
    showRenameField() {
      this.editingName = true
      this.originalName = this.claimPoint.name
    },
    cancelEditClaimPointName() {
      this.editingName = false
      this.claimPoint.name = this.originalName
    },
    editClaimPointName() {
      if (!this.claimPoint.name) {
        return this.cancelEditClaimPointName()
      }
      this.editingName = false
      this.updateSceneElement({
        element: 'claimpoint',
        property: 'name',
        id: this.claimPoint.sk,
        elementData: this.claimPoint,
      })
    },
    toggleVisibility() {
      this.claimPoint.enabled = !this.claimPoint.enabled
      this.updateSceneElement({
        element: 'claimpoint',
        property: 'enabled',
        id: this.claimPoint.sk,
        elementData: this.claimPoint,
      })
    },
    saveKiosk() {
      this.updateClaimPointProperties()
      this.colorPickerDialog = false
    },
    updateClaimPointProperties() {
      Vue.set(this.claimPoint, 'properties', this.properties)
      Vue.set(this.instance, 'properties', this.properties)
      this.updateSceneElement({
        element: 'claimpoint',
        property: 'properties',
        id: this.claimPoint.sk,
        elementData: this.claimPoint,
        instance: true,
        instanceData: this.instance,
      })
    },
    addClaimPoint(claimPoint) {
      this.$emit('addClaimPoint', claimPoint)
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
