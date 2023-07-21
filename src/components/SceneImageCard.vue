<template>
  <v-card elevation="6">
    <div class="d-flex justify-space-between align-center primary pa-4">
      <div class="text-h6" v-if="!editingName">
        {{ truncatedName }}
      </div>
      <v-tooltip v-if="!editingName" top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" class="d-flex-grow-0" icon small dark @click="toggleEditMode()" v-if="!editingName">
            <v-icon small>mdi-rename</v-icon>
          </v-btn>
        </template>
        <span>Rename</span>
      </v-tooltip>

      <div class="text-h5 flex-grow-1" v-if="editingName">
        <v-text-field
          autofocus
          outlined
          color="white"
          label="Image Name"
          v-model="image.name"
          hide-details="auto"
          append-outer-icon="mdi-content-save"
          @click:append-outer="toggleEditMode()"
          @blur="toggleEditMode()"
          dense
          @change="editSoundName()"></v-text-field>
      </div>
    </div>
    <div class="d-flex justify-end align-center black dark pa-1">
      <v-btn icon dark @click="toggleVisibility()" :disabled="image.customRendering">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on" :class="image.enabled ? '' : 'red--text'">
              {{ image.enabled ? "mdi-eye" : "mdi-eye-off" }}
            </v-icon>
          </template>
          <span>Show/Hide All</span>
        </v-tooltip>
      </v-btn>
      <input style="display: none" ref="replaceFileInput" type="file" accept=".png,.jpg,.jpeg" @change="replaceImage(image, i)" />
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
      <v-btn icon dark @click="replaceImage()">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on"> mdi-image-sync </v-icon>
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
    <div class="pa-4 grey darken-4">
      <v-img max-height="250" max-width="250" contain :src="imageLink" class="mx-auto"></v-img>
    </div>
    <div>
      <div class="d-flex justify-start align-center grey darken-2 pa-4">
        <h1 class="text-body-1 font-weight-bold flex-grow-1" dark>Instances</h1>
        <v-btn small @click="addInstance()" class="flex-shrink-1"><v-icon small>mdi-plus</v-icon> Add Instance</v-btn>
      </div>
      <div class="d-flex justify-end align-center px-3" v-if="image.instances.length">
        <v-switch v-model="image.showDetails" class="flex-shrink-1 pa-0" label="Detailed"> Detailed View </v-switch>
      </div>
      <div class="d-flex flex-column pa-4" v-if="!image.instances.length">
        <div class="text-body-1 text-center">Add an instance for this image to see it in the scene.</div>
      </div>
      <div class="d-flex flex-column my-0" v-if="image.instances.length">
        <div v-for="(instance, ii) in image.instances" :key="ii">
          <image-instance-card :instance="instance" :image="image" @updateSceneElement="updateSceneElement" @handleDialog="handleDialog" @addInstance="addInstance" />
        </div>
      </div>
    </div>
  </v-card>
</template>

<script>
import Vue from "vue";
import { mapActions } from "vuex";
import ImageInstanceCard from "./ImageInstanceCard";
import { SceneImage } from "../models/SceneImage";
import { SceneImageInstance } from "../models/SceneImageInstance";
import { EDialogType } from "../models/Dialog";

export default {
  components: {
    ImageInstanceCard,
  },
  name: "SceneImageCard",
  props: {
    property: Object,
    i: Number,
    image: {
      type: Object,
      default: function () {
        return new SceneImage();
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
    this.selectedImage = this.image;
    this.imageLink = this.image.imageLink;
  },
  computed: {
    truncatedName() {
      const imageNameArr = this.image && this.image.name.split("");
      let noSpacesLength = 0;
      let truncated = this.image.name;
      imageNameArr.forEach((char) => {
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

      if (truncated !== this.image.name) {
        return `...${truncated}`;
      } else {
        return this.image.name;
      }
    },
  },
  methods: {
    ...mapActions({
      createSceneElement: "scene/createSceneElement",
      updateSceneElement: "scene/updateSceneElement",
      deleteSceneElement: "scene/deleteSceneElement",
      uploadImage: "image/uploadImage",
    }),
    toggleEditMode() {
      this.editingName = !this.editingName;
    },
    expandPanels() {
      this.panels = [];
      for (let i = 0; i < this.image.instances.length; i++) {
        this.panels.push(i);
      }
    },
    collapsePanels() {
      this.panels = [];
    },
    toggleDetails() {
      Vue.set(this.image, "showDetails", !this.image.showDetails);
    },
    removeImage() {
      this.deleteDialog = false;
      this.$emit("onRemove");
    },
    removeImageInstance(i) {
      const instanceData = this.image.instances[i];
      Vue.delete(this.image.instances, i);

      this.deleteSceneElement({
        element: "image",
        instance: true,
        id: instanceData.id,
        materialId: this.image.id,
        elementData: this.image,
        instanceData,
      });
    },
    addInstance(duplicate) {
      const newInstance = new SceneImageInstance();
      newInstance.name = `Instance ${this.image.instances.length + 1}`;
      newInstance.clickEvent = { ...this.image.clickEvent, synced: true };
      newInstance.scale.x = this.image.width / 1000;
      newInstance.scale.x = this.image.width / 1000;
      newInstance.scale.y = this.image.height / 1000;

      if (duplicate) {
        newInstance.enabled = !!duplicate.enabled;
        newInstance.position = { ...duplicate.position };
        newInstance.scale = { ...duplicate.scale };
        newInstance.rotation = { ...duplicate.rotation };
        newInstance.name = `${duplicate.name} (Copy)`;
        newInstance.clickEvent = { ...duplicate.clickEvent };
      }

      // this.image.instances.push(newInstance);
      this.createSceneElement({
        element: "image",
        instance: true,
        id: newInstance.id,
        elementData: this.image,
        instanceData: newInstance,
      });
    },
    editInstanceName(instance) {
      this.updateSceneElement({
        element: "image",
        instance: true,
        property: "name",
        id: instance.id,
        elementData: this.image,
        instanceData: instance,
      });
    },
    editImageName() {
      this.updateSceneElement({
        element: "image",
        property: "name",
        id: this.image.id,
        elementData: this.image,
      });
    },
    saveImageProperties() {
      this.closePropertiesDialog();
    },
    toggleVisibility() {
      Vue.set(this.image, "enabled", !this.image.enabled);
      this.updateSceneElement({
        element: "image",
        property: "enabled",
        id: this.image.id,
        elementData: this.image,
      });
    },
    openImageClickEventDialog() {
      this.handleDialog({
        type: EDialogType.clickEvent,
        element: this.image,
        callback: this.updateImageClickEvent,
      });
    },
    openImagePropertiesDialog() {
      this.handleDialog({
        type: EDialogType.properties,
        element: this.image,
        callback: this.updateImageProperties,
      });
    },
    openImageDeleteDialog() {
      this.handleDialog({
        type: EDialogType.delete,
        element: this.image,
        callback: this.removeImage,
      });
    },
    updateImageClickEvent() {
      console.log(this.image.clickEvent);
      this.updateSceneElement({
        element: "image",
        property: "clickEvent",
        id: this.image.id,
        elementData: this.image,
      });
    },
    updateImageProperties() {
      this.updateSceneElement({
        element: "image",
        property: "properties",
        id: this.image.id,
        elementData: this.image,
      });
    },
    updateInstanceProperties(instance) {
      this.updateSceneElement({
        element: "imageInstance",
        property: "properties",
        id: instance.id,
        elementData: this.image,
        instanceData: instance,
      });
    },
    panelChange() {
      console.log("panel changed");
    },
    replaceImage() {
      this.handleDialog({
        elementData: this.image,
      });
    },
    handleDialog(dialogOptions) {
      this.$emit("handleDialog", { show: true, ...dialogOptions });
    },
  },
};
</script>
