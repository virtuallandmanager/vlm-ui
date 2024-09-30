<template>
  <div>
    <v-dialog v-model="show" max-width="350" persistent>
      <v-card>
        <v-card-title class="text-h5">{{ dialogTitle }}</v-card-title>
        <v-card-text>
          <v-text-field :label="localeText('Preset Name')" v-model="newPresetName" outlined hide-details></v-text-field>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="closePresetDialog">
            {{ buttonText }}
          </v-btn>
          <v-btn color="grey darken-1" text @click="cancel"> {{ localeAction('cancel') }} </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <content-sub-panel :hasContent="!!presets?.length" :loadingMessage="localeText('Loading')">
      <template v-slot:no-content-header>{{ localeText('NoData') }}</template>
      <template v-slot:no-content-text>
        {{ localeText('CTA') }}
      </template>

      <div v-for="(preset, i) in presets" :key="i" :class="i % 2 ? 'grey darken-4' : 'grey darken-3'">
        <scene-preset-card :preset="preset" v-if="preset" @handleDialog="handleDialog" />
      </div>
      <v-expand-transition>
        <div v-if="loadingPresetList" :class="presets?.length % 2 ? 'grey darken-3' : 'grey darken-4'" class="text-center pa-4">
          <loader :loading="loadingPresetList" :grid="true" />
        </div>
      </v-expand-transition>
      <div :class="presets?.length % 2 ? 'grey darken-4' : 'grey darken-3'" class="text-center pa-4">
        <v-btn class="mx-2" @click="showAddPresetDialog"><v-icon class="mr-1">mdi-plus</v-icon> {{ localeText('Empty Preset') }}</v-btn>
      </div>
    </content-sub-panel>
  </div>
</template>

<script>
import ContentSubPanel from './ContentSubPanel'
import ScenePresetCard from './ScenePresetCard'
import Loader from './Loader'
import { mapActions, mapGetters } from 'vuex'
import { DateTime } from 'luxon'

export default {
  components: {
    ContentSubPanel,
    ScenePresetCard,
    Loader,
  },
  name: 'ScenePresetList',
  data: () => ({
    show: false,
    dialogTitle: '',
    buttonText: '',
    presetToEdit: { name: '' },
    newPresetName: '',
    dialogCallback: () => {},
  }),

  computed: {
    ...mapGetters({
      scene: 'scene/activeScene',
      loadingPresetList: 'scene/loadingPresetList',
      localeText: 'i18n/scenePresets',
      localeAction: 'i18n/actions',
    }),
    presets() {
      return this.scene?.presets
    },
  },
  methods: {
    ...mapActions({ addPreset: 'scene/addPreset', clonePreset: 'scene/clonePreset' }),
    createdDate(ts) {
      if (ts) {
        return DateTime.fromMillis(Number(ts)).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)
      } else return ''
    },
    showAddPresetDialog() {
      this.handleDialog({ show: true, title: 'New Preset Name', callback: this.addPreset, buttonText: 'Create Preset' })
    },
    cancel() {
      this.show = false
    },
    handleDialog(dialogOptions) {
      this.show = dialogOptions.show
      this.buttonText = dialogOptions.buttonText || 'Save'
      this.dialogTitle = dialogOptions.title
      this.dialogCallback = dialogOptions.callback
      this.presetToEdit = dialogOptions.preset
      this.newPresetName = dialogOptions.preset?.name || ''
    },
    closePresetDialog() {
      this.show = false
      this.dialogCallback(this.newPresetName)
      this.newPresetName = ''
    },
  },
}
</script>

<style scoped>
.scene-element-tiles button {
  margin: 4px;
}
</style>
