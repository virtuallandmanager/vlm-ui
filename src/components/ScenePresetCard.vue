<template>
  <div>
    <div class="d-flex pa-4 justify-space-between">
      <div class="info-section d-flex flex-column justify-start align-start">
        <div class="text-h5 white--text">{{ preset?.name }}</div>
        <div v-if="preset?.createdAt">Created {{ createdDate(preset.createdAt) }}</div>
        <div class="scene-element-tiles">
          <v-btn text class="d-inline" v-if="preset.videos"><v-icon class="mr-2">mdi-television</v-icon> {{ preset.videos.length }}</v-btn>
          <v-btn text class="d-inline" v-if="preset.images"><v-icon class="mr-2">mdi-image-frame</v-icon> {{ preset.images.length + preset.nfts.length }}</v-btn>
          <v-btn text class="d-inline" v-if="preset.sounds"><v-icon class="mr-2">mdi-speaker</v-icon> {{ preset.sounds.length }}</v-btn>
          <v-btn text class="d-inline" v-if="preset.widgets"><v-icon class="mr-2">mdi-palette</v-icon> {{ preset.widgets.length }}</v-btn>
        </div>
      </div>
      <div class="d-flex flex-column">
        <div class="d-flex justify-space-around pb-1">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon class="mx-2" @click="showRenameDialog" v-bind="attrs" v-on="on">
                <v-icon small>mdi-rename</v-icon>
              </v-btn>
            </template>
            <span>Rename Preset</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon class="mx-2" @click="showCloneDialog" v-bind="attrs" v-on="on">
                <v-icon small>mdi-content-duplicate</v-icon>
              </v-btn>
            </template>
            <span>Clone Preset</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon :disabled="scene.scenePreset === preset.sk" class="mx-2" @click="() => deletePreset(preset.sk)" v-bind="attrs" v-on="on">
                <v-icon small>mdi-trash-can</v-icon>
              </v-btn>
            </template>
            <span>Delete Preset</span>
          </v-tooltip>
        </div>
        <div class="text-right">
          <v-btn v-if="scene.scenePreset !== preset.sk" color="primary" block @click="() => changePreset(preset.sk)"> <v-icon class="mr-1">mdi-archive-sync</v-icon> APPLY</v-btn>
          <v-btn disabled outlined v-else color="primary" block> <v-icon class="mr-1">mdi-archive-check</v-icon> ACTIVE</v-btn>
        </div>
        <div></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { DateTime } from "luxon";

export default {
  name: "ScenePresetCard",
  props: {
    preset: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },
  data: () => ({
    nameDialog: false,
    dialogCallback: () => {},
  }),
  computed: {
    ...mapGetters({ scene: "scene/activeScene" }),
  },
  methods: {
    ...mapActions({ changePreset: "scene/changeScenePreset", clonePreset: "scene/clonePreset", updatePresetProperty: "scene/updatePresetProperty", deletePreset: "scene/deletePreset" }),
    createdDate(ts) {
      if (ts) {
        return DateTime.fromSeconds(Number(ts)).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY);
      } else return "";
    },
    showRenameDialog() {
      this.$emit("handleDialog", { show: true, title: "Rename Preset", preset: this.preset, callback: () => this.updatePresetProperty({ preset: this.preset, prop: "name" }) });
    },
    showCloneDialog() {
      this.$emit("handleDialog", { show: true, title: "New Preset Name", preset: {...this.preset}, callback: this.clonePreset });
    },
  },
};
</script>

<style scoped>
.scene-element-tiles button {
  margin: 4px;
}
</style>
