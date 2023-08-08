<template>
  <div>
    <div class="d-flex justify-space-between align-center purple darken-3 pa-4">
      <div class="text-h6 d-flex-shrink-1 align-center" v-if="!editingName"><v-icon class="mr-2">mdi-image-frame</v-icon>{{ truncatedName }}</div>
      <v-tooltip v-if="!editingName" top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" class="d-flex-grow-0" icon small dark @click="toggleEditMode()" v-if="!editingName">
            <v-icon small>mdi-rename</v-icon>
          </v-btn>
        </template>
        <span>Rename</span>
      </v-tooltip>

      <div class="text-h5" v-if="editingName">
        <v-text-field
          autofocus
          dark
          label="Image Name"
          v-model="nft.name"
          hide-details="auto"
          class="mt-2 mb-n2"
          append-outer-icon="mdi-content-save"
          @click:append-outer="toggleEditMode()"
          @blur="toggleEditMode()"
          dense
          @change="editImageName()"></v-text-field>
      </div>
    </div>
    <div class="d-flex flex-column justify-space-between align-center black dark py-1">
      <div>
        <v-btn icon dark @click="toggleVisibility()" :disabled="nft.customRendering">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on" :class="nft.enabled ? '' : 'red--text'">
                {{ nft.enabled ? "mdi-eye" : "mdi-eye-off" }}
              </v-icon>
            </template>
            <span>Show/Hide All</span>
          </v-tooltip>
        </v-btn>
        <input style="display: none" ref="replaceFileInput" type="file" accept=".png,.jpg,.jpeg" @change="replaceImage(nft, i)" />
        <v-btn icon dark @click.stop="openImageClickEventDialog()">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on"> mdi-mouse </v-icon>
            </template>
            <span>Default Click Action</span>
          </v-tooltip>
        </v-btn>
        <v-btn icon dark @click.stop="openImagePropertiesDialog()">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on"> mdi-tune </v-icon>
            </template>
            <span>Image Properties</span>
          </v-tooltip>
        </v-btn>
        <v-btn icon dark @click="$refs.replaceFileInput.click()">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on"> mdi-upload </v-icon>
            </template>
            <span>Replace Image</span>
          </v-tooltip>
        </v-btn>
        <v-btn icon dark @click.stop="openImageDeleteDialog()">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on"> mdi-trash-can </v-icon>
            </template>
            <span>Remove Image</span>
          </v-tooltip>
        </v-btn>
      </div>
    </div>
    <div class="py-4 grey darken-4">
      <v-img max-height="250" max-width="250" contain :src="imageLink" class="mx-auto"></v-img>
    </div>
    <div>
      <div class="d-flex justify-start align-center purple lighten-1 pa-4">
        <h1 class="text-body-1 font-weight-bold flex-grow-1" dark>Instances</h1>
        <v-btn small @click="addInstance()" color="primary" class="flex-shrink-1"><v-icon small>mdi-plus</v-icon> Add Instance</v-btn>
      </div>
      <div class="d-flex justify-end align-center px-3">
        <v-switch v-model="nft.showDetails" class="flex-shrink-1 pa-0" label="Detailed"> Detailed View </v-switch>
      </div>
      <div class="d-flex flex-column pa-4" v-if="!nft.instances.length">
        <div class="text-body-1 text-center">Add an instance for this nft to see it in the scene.</div>
      </div>
      <div class="d-flex flex-column my-0" v-if="nft.instances.length">
        <div v-for="(instance, ii) in nft.instances" :key="ii">
          <nft-instance-card :instance="instance" :nft="nft" :i="ii" @updateProperties="updateProperties" @addInstance="addInstance" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { mapActions } from "vuex";
import NftInstanceCard from "./NftInstanceCard";
import { SceneNft } from "../models/SceneNft";
import { SceneNftInstance } from "../models/SceneNftInstance";
import { EDialogType } from "../models/Dialog";

export default {
  components: {
    NftInstanceCard,
  },
  name: "SceneNftCard",
  props: {
    property: Object,
    i: Number,
    nft: {
      type: Object,
      default: function () {
        return new SceneNft();
      },
    },
  },
  data: () => ({
    dialogCallback: () => {},
    selectedImage: null,
    selectedInstance: null,
    editingName: false,
    clickEvents: [
      { text: "None", value: 0, default: true },
      { text: "Website Link", value: 1 },
      { text: "Play Sound (Coming Soon)", value: 2, disabled: true },
      { text: "Move Player in Scene (Coming Soon)", value: 3, disabled: true },
      { text: "Teleport Player (Coming Soon)", value: 4, disabled: true },
    ],
    panels: [],
    imageLink: "",
  }),
  mounted() {
    this.selectedImage = this.nft;
    this.imageLink = this.nft.imageLink;
  },
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
    ...mapActions({
      uploadImage: "nft/uploadImage",
    }),
    toggleEditMode() {
      this.editingName = !this.editingName;
    },
    expandPanels() {
      this.panels = [];
      for (let i = 0; i < this.nft.instances.length; i++) {
        this.panels.push(i);
      }
    },
    collapsePanels() {
      this.panels = [];
    },
    toggleDetails() {
      Vue.set(this.nft, "showDetails", !this.nft.showDetails);
    },
    removeImage() {
      this.deleteDialog = false;
      this.$emit("onRemove");
    },
    removeImageInstance(i) {
      const instanceData = this.nft.instances[i];
      Vue.delete(this.nft.instances, i);

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
    addInstance(duplicate) {
      const newInstance = new SceneNftInstance();
      newInstance.name = `Instance ${this.nft.instances.length + 1}`;
      newInstance.clickEvent = { ...this.nft.clickEvent, synced: true };
      newInstance.scale.x = this.nft.width / 1000;
      newInstance.scale.x = this.nft.width / 1000;
      newInstance.scale.y = this.nft.height / 1000;

      if (duplicate) {
        newInstance.enabled = !!duplicate.enabled;
        newInstance.position = { ...duplicate.position };
        newInstance.scale = { ...duplicate.scale };
        newInstance.rotation = { ...duplicate.rotation };
        newInstance.name = `${duplicate.name} (Copy)`;
        newInstance.clickEvent = { ...duplicate.clickEvent };
      }

      this.nft.instances.push(newInstance);
      this.updateProperties({
        action: "create",
        element: "nft",
        instance: true,
        id: newInstance.id,
        elementData: this.nft,
        instanceData: newInstance,
      });
    },
    editInstanceName(instance) {
      this.updateProperties({
        action: "update",
        element: "nft",
        instance: true,
        property: "name",
        id: instance.id,
        elementData: this.nft,
        instanceData: instance,
      });
    },
    editImageName() {
      this.updateProperties({
        action: "update",
        element: "nft",
        property: "name",
        id: this.nft.id,
        elementData: this.nft,
      });
    },
    saveImageProperties() {
      this.closePropertiesDialog();
    },
    toggleVisibility(instance) {
      if (instance) {
        Vue.set(instance, "enabled", !instance.enabled);
        this.updateProperties({
          action: "update",
          element: "nft",
          instance: true,
          property: "enabled",
          id: instance.id,
          elementData: this.nft,
          instanceData: instance,
        });
      } else {
        Vue.set(this.nft, "enabled", !this.nft.enabled);
        this.updateProperties({
          action: "update",
          element: "nft",
          property: "enabled",
          id: this.nft.id,
          elementData: this.nft,
        });
      }
    },
    openImageClickEventDialog() {
      this.handleDialog({
        type: EDialogType.clickEvent,
        element: this.nft,
        callback: this.updateImageClickEvent,
      });
    },
    openImagePropertiesDialog() {
      this.handleDialog({
        type: EDialogType.properties,
        element: this.nft,
        callback: this.updateImageProperties,
      });
    },
    openImageDeleteDialog() {
      this.handleDialog({
        type: EDialogType.delete,
        element: this.nft,
        callback: this.removeImage,
      });
    },
    updateImageClickEvent() {
      this.updateProperties({
        action: "update",
        element: "nft",
        property: "clickEvent",
        id: this.nft.id,
        elementData: this.nft,
      });
    },
    updateImageProperties() {
      this.updateProperties({
        action: "update",
        element: "nft",
        property: "properties",
        id: this.nft.id,
        elementData: this.nft,
      });
    },
    updateInstanceProperties(instance) {
      this.updateProperties({
        action: "update",
        element: "nft",
        instance: true,
        property: "properties",
        id: instance.id,
        elementData: this.nft,
        instanceData: instance,
      });
    },
    panelChange() {
    },
    updateProperties(wssMessages) {
      this.$emit("updateProperties", wssMessages);
    },
    handleDialog(dialogOptions) {
      this.$emit("handleDialog", { show: true, ...dialogOptions });
    },
  },
};
</script>
