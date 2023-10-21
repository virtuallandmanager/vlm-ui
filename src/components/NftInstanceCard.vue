<template>
  <div>
    <div class="d-flex ma-0 pa-3 align-center grey" :class="i % 2 ? 'darken-3' : 'darken-4'">
      <!-- <span class="grey--text flex-shrink-1 flex-grow-0 pr-1">{{ i + 1 }}</span> -->
      <span class="grey--text flex-shrink-1 flex-grow-0 pr-1">
        <v-btn icon @click.stop="toggleVisibility()" :disabled="nft.customRendering || instance.customRendering">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on" :class="nft.enabled && instance.enabled ? '' : 'red--text'">
                {{ nft.enabled && instance.enabled ? "mdi-eye" : "mdi-eye-off" }}
              </v-icon>
            </template>
            <span>Show/Hide</span>
          </v-tooltip>
        </v-btn></span>
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
          <v-btn small icon @click.stop="() => { }
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
    <quick-view v-if="nft.showDetails" :instance="instance" class="grey px-3" :class="i % 2 ? 'darken-3' : 'darken-4'" />
    <div class="d-flex pb-3 flex-row justify-space-around grey" :class="i % 2 ? 'darken-3' : 'darken-4'">
      <v-btn icon @click.stop="() => { }

        ">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on"> mdi-axis-arrow </v-icon>
          </template>
          <span>Transform</span>
        </v-tooltip>
      </v-btn>
      <v-btn icon @click.stop="() => { }

        ">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on"> mdi-mouse </v-icon>
          </template>
          <span>Click Action</span>
        </v-tooltip>
      </v-btn>
      <v-btn icon @click.stop="() => { }

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
import { SceneNft } from "../models/SceneNft";
import { SceneNftInstance } from "../models/SceneNftInstance";
import QuickView from "./QuickView.vue";

export default {
  components: { QuickView },
  name: "ImageInstanceCard",
  props: {
    property: Object,
    i: Number,
    instance: {
      type: Object,
      default: function () {
        return new SceneNftInstance();
      },
    },
    nft: {
      type: Object,
      default: function () {
        return new SceneNft();
      },
    },
  },
  data: () => ({
    EDialogType: EDialogType,
    editingName: false,
  }),
  computed: {
    truncatedName() {
      const nftNameArr = this.nft && this.nft.name.split("");
      let noSpacesLength = 0;
      let truncated = this.nft.name;
      nftNameArr.forEach((char) => {
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

      if (truncated !== this.nft.name) {
        return `...${truncated}`;
      } else {
        return this.nft.name;
      }
    },
  },
  methods: {
    showRenameField() {
      this.editingName = true;
      this.originalName = this.instance.name;
    },
    removeImageInstance() {
      const instanceData = { ...this.nft.instances[this.i] };
      Vue.delete(this.nft.instances, this.i);

      this.updateProperties({
        action: "delete",
        element: "nft",
        instance: true,
        id: instanceData.id,
        materialId: this.nft.id,
        elementData: this.nft,
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
        element: "nft",
        instance: true,
        property: "name",
        id: this.instance.id,
        elementData: this.nft,
        instanceData: this.instance,
      });
    },
    toggleVisibility() {
      Vue.set(this.instance, "enabled", !this.instance.enabled);
      this.updateProperties({
        action: "update",
        element: "nft",
        instance: true,
        property: "enabled",
        id: this.instance.id,
        elementData: this.nft,
        instanceData: this.instance,
      });
    },
    updateInstanceClickEvent() {
      this.updateProperties({
        action: "update",
        element: "nft",
        instance: true,
        property: "clickEvent",
        id: this.instance.id,
        elementData: this.nft,
        instanceData: this.instance,
      });
    },
    updateInstanceProperties() {
      this.updateProperties({
        action: "update",
        element: "nftInstance",
        property: "properties",
        id: this.instance.id,
        elementData: this.nft,
        instanceData: this.instance,
      });
    },
    updateInstanceTransform() {
      this.updateProperties({
        action: "update",
        element: "nft",
        instance: true,
        property: "transform",
        custom: this.instance.customRendering,
        id: this.instance.id,
        elementData: this.nft,
        instanceData: this.instance,
      });
    },
    addInstance(instance) {
      this.$emit("addInstance", instance);
    },
    updateProperties(wssMessages) {
      this.$emit("updateProperties", wssMessages);
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
