<template>
  <div>
    <div class="d-flex ma-0 pa-3 align-center grey" :class="i % 2 ? 'darken-3' : 'darken-4'">
      <span class="grey--text flex-shrink-1 flex-grow-0 pr-1">
        <v-btn icon @click.stop="toggleMute()" :disabled="sound.customRendering || instance.customRendering">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on" :class="sound.enabled && instance.enabled ? '' : 'red--text'">
                {{ sound.enabled && instance.enabled ? "mdi-volume-high" : "mdi-volume-variant-off" }}
              </v-icon>
            </template>
            <span>Mute/Unmute</span>
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
              deleteSceneElement({
                element: 'sound',
                elementData: sound,
                instance: true,
                instanceData: instance,
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
    <quick-view v-if="sound.showDetails" :instance="instance" class="grey px-3" :class="i % 2 ? 'darken-3' : 'darken-4'" />
    <div class="d-flex pb-3 flex-row justify-space-around grey" :class="i % 2 ? 'darken-3' : 'darken-4'">
      <v-btn
        icon
        @click.stop="
          showTransformDialog({
            element: 'sound',
            elementData: sound,
            instance: true,
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
          showPropertiesDialog({
            element: 'sound',
            elementData: sound,
            instance: true,
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
import { mapActions } from "vuex";
import { EDialogType } from "../models/Dialog";
import { SceneSound } from "../models/SceneSound";
import { SceneSoundInstance } from "../models/SceneSoundInstance";
import QuickView from "./QuickView.vue";

export default {
  components: { QuickView },
  name: "SoundInstanceCard",
  props: {
    property: Object,
    i: Number,
    instance: {
      type: Object,
      default: function () {
        return new SceneSoundInstance();
      },
    },
    sound: {
      type: Object,
      default: function () {
        return new SceneSound();
      },
    },
  },
  data: () => ({
    EDialogType: EDialogType,
    editingName: false,
  }),
  computed: {
    truncatedName() {
      const soundNameArr = this.sound && this.sound.name.split("");
      let noSpacesLength = 0;
      let truncated = this.sound.name;
      soundNameArr.forEach((char) => {
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

      if (truncated !== this.sound.name) {
        return `...${truncated}`;
      } else {
        return this.sound.name;
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
    removeSoundInstance() {
      const instanceData = { ...this.sound.instances[this.i] };
      Vue.delete(this.sound.instances, this.i);

      this.deleteSceneElement({
        element: "sound",
        instance: true,
        id: instanceData.id,
        materialId: this.sound.id,
        elementData: this.sound,
        instanceData,
      });
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
      this.updateProperties({
        action: "update",
        element: "sound",
        instance: true,
        property: "name",
        id: this.instance.id,
        elementData: this.sound,
        instanceData: this.instance,
      });
    },
    toggleMute() {
      this.instance.enabled = !this.instance.enabled;
      this.updateProperties({
        action: "update",
        element: "sound",
        instance: true,
        property: "enabled",
        id: this.instance.id,
        elementData: this.sound,
        instanceData: this.instance,
      });
    },
    updateInstanceClickEvent() {
      this.updateProperties({
        action: "update",
        element: "sound",
        instance: true,
        property: "clickEvent",
        id: this.instance.id,
        elementData: this.sound,
        instanceData: this.instance,
      });
    },
    updateInstanceProperties() {
      this.updateProperties({
        action: "update",
        element: "sound",
        instance: true,
        property: "properties",
        id: this.instance.id,
        elementData: this.sound,
        instanceData: this.instance,
      });
    },
    updateInstanceTransform() {
      this.updateProperties({
        action: "update",
        element: "sound",
        instance: true,
        property: "transform",
        custom: this.instance.customRendering,
        id: this.instance.id,
        elementData: this.sound,
        instanceData: this.instance,
      });
    },
    addInstance(instance) {
      this.$emit("addInstance", instance);
    },
    updateProperties(wssMessages) {
      this.$emit("updateProperties", wssMessages);
    },
    handleDialog(options) {
      const dialogOptions = {
        show: options.show || true,
        type: options.type,
        callback: options.callback,
        element: this.sound,
        instance: this.instance,
      };

      this.$emit("handleDialog", dialogOptions);
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
