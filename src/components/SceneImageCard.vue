<template>
  <div>
    <input type="file" ref="fileInput" accept="image/*" style="display: none" @change="onFileSelected" />
    <v-dialog v-if="replaceImageDialog" v-model="replaceImageDialog" width="500">
      <v-card>
        <v-card-title class="text-h5"> Replace Image </v-card-title>

        <v-card-text class="d-flex justify-space-between lighten-1">
          <v-card class="flex-grow-1 text-center pa-4 mr-2" @click.stop="selectImage">
            <v-icon>mdi-file-image</v-icon>
            <div class="text-button">From My Computer</div>
          </v-card>
          <v-card class="flex-grow-1 text-center pa-4 ml-2" @click.stop="showExternalUrlDialog">
            <v-icon>mdi-link-variant</v-icon>
            <div class="text-button">External URL</div>
          </v-card>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-if="externalUrlDialog" v-model="externalUrlDialog" width="500">
      <v-card>
        <v-card-title class="text-h5"> External Image URL </v-card-title>

        <v-card-text class="d-flex justify-space-between lighten-1">
          <v-text-field v-model="newImageSrc" label="Image URL" prepend-icon="mdi-file-image"> </v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="resetDialogs">Cancel</v-btn>
          <v-btn color="primary" text @click="setExternalImage">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
            @change="editImageName()"></v-text-field>
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
        <input style="display: none" ref="replaceFileInput" type="file" accept=".png,.jpg,.jpeg" @change="updateImage(image, i)" />
        <v-btn
          icon
          dark
          @click.stop="
            showClickEventDialog({
              element: 'image',
              elementData: image,
            })
          ">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on"> mdi-mouse </v-icon>
            </template>
            <span>Default Click Action</span>
          </v-tooltip>
        </v-btn>
        <v-btn
          icon
          dark
          @click.stop="
            showPropertiesDialog({
              element: 'image',
              elementData: image,
            })
          ">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on"> mdi-tune </v-icon>
            </template>
            <span>Image Properties</span>
          </v-tooltip>
        </v-btn>
        <v-btn icon dark @click="showReplaceImageDialog()">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on"> mdi-image-sync </v-icon>
            </template>
            <span>Replace Image</span>
          </v-tooltip>
        </v-btn>
        <v-btn
          icon
          dark
          @click.stop="
            showDeleteDialog({
              element: 'image',
              elementData: image,
            })
          ">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on"> mdi-trash-can </v-icon>
            </template>
            <span>Remove Image</span>
          </v-tooltip>
        </v-btn>
      </div>
      <div class="pa-4 grey darken-4">
        <v-img max-height="250" max-width="250" contain :src="imageSrc" class="mx-auto"></v-img>
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
            <image-instance-card :instance="instance" :image="image" @updateSceneElement="updateSceneElement" @addInstance="addInstance" />
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
import Vue from "vue";
import { mapActions } from "vuex";
import ImageInstanceCard from "./ImageInstanceCard";
import { SceneImage } from "../models/SceneImage";
import { SceneImageInstance } from "../models/SceneImageInstance";

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
    replaceImageDialog: false,
    externalUrlDialog: false,
    selectedImage: null,
    selectedInstance: null,
    editingName: false,
    newImageSrc: "",
    clickEvents: [
      { text: "None", value: 0, default: true },
      { text: "Website Link", value: 1 },
      { text: "Play Sound (Coming Soon)", value: 2, disabled: true },
      { text: "Move Player in Scene (Coming Soon)", value: 3, disabled: true },
      { text: "Teleport Player (Coming Soon)", value: 4, disabled: true },
    ],
    panels: [],
  }),
  mounted() {
    this.selectedImage = this.image;
  },
  computed: {
    imageSrc() {
      return this.image.thumbnailSrc ? this.image.thumbnailSrc : this.image.imageSrc;
    },
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
      showTransformDialog: "dialog/showTransformDialog",
      showPropertiesDialog: "dialog/showPropertiesDialog",
      showClickEventDialog: "dialog/showClickEventDialog",
      showDeleteDialog: "dialog/showDeleteDialog",
      createSceneElement: "scene/createSceneElement",
      updateSceneElement: "scene/updateSceneElement",
      deleteSceneElement: "scene/deleteSceneElement",
      uploadImage: "media/uploadUserImage",
    }),
    validateExternalLink(value) {
      if (!value) {
        this.hasErrors = true;
        return "Enter a website URL";
      } else if (value.includes("https://")) {
        this.hasErrors = false;
        return true;
      } else {
        this.hasErrors = true;
        return "Must use https:// links";
      }
    },
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
    updateImageClickEvent() {
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
    resetDialogs() {
      this.replaceImageDialog = false;
      this.externalUrlDialog = false;
    },
    selectImage() {
      this.$refs.fileInput.click();
    },
    setExternalImage() {
      const objThis = this;
      const currentImage = objThis.image;
      if (this.validateExternalLink(this.newImageSrc) === true) {
        let img = new Image();
        img.src = this.newImageSrc;
        img.onload = function () {
          currentImage.width = this.width;
          currentImage.height = this.height;
          currentImage.textureSrc = "";
          currentImage.thumbnailSrc = "";
          const newImage = new SceneImage({
            ...currentImage,
            name: "External Image",
            imageSrc: this.src,
            externalUrl: true,
          });

          objThis.updateImage(newImage);
          objThis.newImageSrc = "";
          objThis.resetDialogs();
        };
      }
    },
    async onFileSelected(e) {
      this.resetDialogs();
      const options = {
        image: e.target.files[0],
      };
      e.target.value = null;

      try {
        const uploadImageRes = await this.uploadImage(options);
        this.image.thumbnailSrc = `${process.env.VUE_APP_API_URL}/${uploadImageRes.imageSrc}`;
        this.image.textureSrc = `${process.env.VUE_APP_API_URL}/${uploadImageRes.textureSrc}`;
        this.image.imageSrc = `${process.env.VUE_APP_API_URL}/${uploadImageRes.thumbnailSrc}`;
        this.image.externalUrl = false;
        const metadata = uploadImageRes.metadata;

        const newImage = new SceneImage({
          ...this.image,
          name: metadata.name,
          height: metadata.height,
          width: metadata.width,
          density: metadata.density,
        });

        await this.updateImage(newImage);
      } catch (err) {
        console.log(err);
      }
    },
    showExternalUrlDialog() {
      this.resetDialogs();
      this.externalUrlDialog = true;
    },
    showReplaceImageDialog() {
      this.resetDialogs();
      this.replaceImageDialog = true;
    },
    async updateImage(image) {
      this.resetDialogs();
      return this.updateSceneElement({
        element: "image",
        elementData: image,
        id: image.sk,
      });
    },
  },
};
</script>
