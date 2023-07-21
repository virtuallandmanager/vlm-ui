<template>
  <div>
    <div class="d-flex ma-0 pa-3 align-center grey" :class="i % 2 ? 'darken-3' : 'darken-4'">
      <span class="grey--text flex-shrink-1 flex-grow-0 pr-1">
        <v-btn icon @click.stop="toggleVisibility()" :disabled="video.customRendering || instance.customRendering">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on" :class="video.enabled && instance.enabled ? '' : 'red--text'">
                {{ video.enabled && instance.enabled ? "mdi-eye" : "mdi-eye-off" }}
              </v-icon>
            </template>
            <span>Show/Hide</span>
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
              <span>Rename</span>
            </v-tooltip>
          </v-btn>
        </div>
        <div>
          <v-btn small icon @click="addInstance(instance)">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon small v-bind="attrs" v-on="on"> mdi-content-duplicate </v-icon>
              </template>
              <span>Duplicate</span>
            </v-tooltip>
          </v-btn>
        </div>
        <div>
          <v-btn
            small
            icon
            @click.stop="
              showDeleteDialog({
                element: 'video',
                elementData: video,
                instance: true,
                instanceData: instance,
                id: instance.sk
              })
            ">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon small v-bind="attrs" v-on="on"> mdi-trash-can </v-icon>
              </template>
              <span>Remove</span>
            </v-tooltip>
          </v-btn>
        </div>
      </div>
    </div>
    <quick-view v-if="video.showDetails" :instance="instance" class="grey px-3" :class="i % 2 ? 'darken-3' : 'darken-4'" />
    <div class="d-flex pb-3 flex-row justify-space-around grey" :class="i % 2 ? 'darken-3' : 'darken-4'">
      <v-btn
        icon
        @click.stop="
          showTransformDialog({
            title: 'Video Instance',
            element: 'video',
            elementData: video,
            instanceData: instance,
          })
        ">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on"> mdi-axis-arrow </v-icon>
          </template>
          <span>Transform</span>
        </v-tooltip>
      </v-btn>
      <v-btn
        icon
        @click.stop="
          showClickEventDialog({
            title: 'Video Instance',
            instance: true,
            element: 'video',
            elementData: video,
            instanceData: instance,
          })
        ">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on"> mdi-mouse </v-icon>
          </template>
          <span>Click Action</span>
        </v-tooltip>
      </v-btn>
      <v-btn
        icon
        @click.stop="
          showPropertiesDialog({
            title: 'Video Instance',
            instance: true,
            element: 'video',
            elementData: video,
            instanceData: instance,
          })
        ">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on"> mdi-tune </v-icon>
          </template>
          <span>Instance Properties</span>
        </v-tooltip>
      </v-btn>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { EDialogType } from "../models/Dialog";
import { SceneVideo } from "../models/SceneVideo";
import { SceneVideoInstance } from "../models/SceneVideoInstance";
import QuickView from "./QuickView.vue";
import { mapActions } from "vuex";

export default {
  components: { QuickView },
  name: "VideoInstanceCard",
  props: {
    property: Object,
    i: Number,
    instance: {
      type: Object,
      default: function () {
        return new SceneVideoInstance();
      },
    },
    video: {
      type: Object,
      default: function () {
        return new SceneVideo();
      },
    },
  },
  data: () => ({
    EDialogType: EDialogType,
    editingName: false,
  }),
  computed: {
    truncatedName() {
      const videoNameArr = this.video && this.video.name.split("");
      let noSpacesLength = 0;
      let truncated = this.video.name;
      videoNameArr.forEach((char) => {
        if (char !== " ") {
          noSpacesLength++;
        } else {
          noSpacesLength = 0;
        }

        if (noSpacesLength > 18) {
          truncated = truncated.substr(truncated.length - 18);
          noSpacesLength = 0;
        }
      });

      if (truncated !== this.video.name) {
        return `...${truncated}`;
      } else {
        return this.video.name;
      }
    },
  },
  methods: {
    ...mapActions({
      showTransformDialog: "dialog/showTransformDialog",
      showDeleteDialog: "dialog/showDeleteDialog",
      showPropertiesDialog: "dialog/showPropertiesDialog",
      showClickEventDialog: "dialog/showClickEventDialog",
      updateSceneElement: "scene/updateSceneElement",
      deleteSceneElement: "scene/deleteSceneElement",
    }),
    showRenameField() {
      this.editingName = true;
      this.originalName = this.instance.name;
    },
    cancelEditInstanceName() {
      this.editingName = false;
      this.instance.name = this.originalName;
    },
    editInstanceName() {
      if (!this.instance.name) {
        return this.cancelEditInstanceName();
      }
      this.editingName = false;
      this.updateSceneElement({
        element: "video",
        instance: true,
        property: "name",
        id: this.instance.id,
        elementData: this.video,
        instanceData: this.instance,
      });
    },
    toggleVisibility() {
      Vue.set(this.instance, "enabled", !this.instance.enabled);
      this.updateSceneElement({
        element: "video",
        instance: true,
        property: "enabled",
        id: this.instance.id,
        elementData: this.video,
        instanceData: this.instance,
      });
    },
    updateInstanceClickEvent() {
      this.updateSceneElement({
        element: "video",
        instance: true,
        property: "clickEvent",
        id: this.instance.id,
        elementData: this.video,
        instanceData: this.instance,
      });
    },
    updateInstanceProperties() {
      this.updateSceneElement({
        element: "video",
        instance: true,
        property: "properties",
        id: this.instance.id,
        elementData: this.video,
        instanceData: this.instance,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.row-label {
  font-size: 0.5em;
  text-transform: uppercase;
  font-weight: bold;
}
</style>
