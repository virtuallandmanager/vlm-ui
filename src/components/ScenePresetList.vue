<template>
  <div>
    <v-dialog v-model="show" max-width="350" persistent>
      <v-card>
        <v-card-title class="text-h5">{{ dialogTitle }}</v-card-title>
        <v-card-text>
          <v-text-field label="Preset Name" v-model="newPresetName" outlined hide-details></v-text-field>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="closePresetDialog">
            {{ buttonText }}
          </v-btn>
          <v-btn color="grey darken-1" text @click="cancel"> Cancel </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <content-sub-panel :hasContent="!!presets?.length" loadingMessage="Loading presets...">
      <template v-slot:no-content-header>No Presets Found</template>
      <template v-slot:no-content-text>
        Hmmm... that's strange. Every scene starts with one preset, but yours seems to be missing!<br />
        Please contact support and we'll get to the bottom of it.
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
        <v-btn class="mx-2" @click="showAddPresetDialog"><v-icon class="mr-1">mdi-plus</v-icon> Empty Preset</v-btn>
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
