<template>
  <div>
    <v-dialog v-model="show" max-width="350" persistent>
      <v-card>
        <v-card-title class="text-h5">{{ dialogTitle }}</v-card-title>
        <v-card-text>
          <v-text-field label="Name" outlined v-model="presetToEdit.name" hide-details></v-text-field>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialogCallback">
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
        <scene-preset-card :preset="preset" @handleDialog="handleDialog" />
      </div>

      <div :class="presets.length % 2 ? 'grey darken-4' : 'grey darken-3'" class="text-center pa-4">
        <v-btn class="mx-2" @click="showAddPresetDialog"><v-icon small class="mr-1">mdi-archive-plus</v-icon> Create Empty Preset</v-btn>
      </div>
    </content-sub-panel>
  </div>
</template>

<script>
import ContentSubPanel from "./ContentSubPanel";
import ScenePresetCard from "./ScenePresetCard";
import { mapActions, mapGetters } from "vuex";
import { DateTime } from "luxon";

export default {
  components: {
    ContentSubPanel,
    ScenePresetCard,
  },
  name: "ScenePresetList",
  data: () => ({
    show: false,
    dialogTitle: "",
    buttonText: "",
    presetToEdit: { name: "" },
    dialogCallback: () => {},
  }),

  computed: {
    ...mapGetters({ processing: "scene/processing", scene: "scene/activeScene", updatePresetProperty: "scene/updatePresetProperty" }),
    presets() {
      return this.scene.presets;
    },
  },
  methods: {
    ...mapActions({ addPreset: "scene/addPreset", clonePreset: "scene/clonePreset" }),
    createdDate(ts) {
      if (ts) {
        return DateTime.fromSeconds(Number(ts)).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY);
      } else return "";
    },
    showAddPresetDialog() {
      this.handleDialog({ show: true, title: "New Preset Name", callback: () => this.updatePresetProperty({}), buttonText: "Create Preset" });
    },
    cancel() {
      this.show = false;
    },
    handleDialog(dialogOptions) {
      console.log(dialogOptions);
      this.show = dialogOptions.show;
      this.buttonText = dialogOptions.buttonText || "Save";
      this.dialogTitle = dialogOptions.title;
      this.dialogCallback = dialogOptions.callback;
      this.presetToEdit = dialogOptions.preset;
    },
  },
};
</script>

<style scoped>
.scene-element-tiles button {
  margin: 4px;
}
</style>
