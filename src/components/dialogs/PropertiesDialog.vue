<template>
  <v-dialog v-model="show" max-width="350" persistent>
    <v-card>
      <v-card-title class="text-h5">{{ element.capitalize() }}{{ instance && " Instance" }} Properties </v-card-title>
      <v-card-text>
        <div v-if="element == 'image' && !instance" class="text-body-1 font-weight-bold">Appearance</div>
        <v-switch v-if="element == 'image'" v-model="elementData.isTransparent" label="Enable Transparency" :disabled="instance" @change="changeTransparency"></v-switch>
        <div v-if="instance" class="text-body-1 font-weight-bold">Interactions</div>
        <v-switch v-if="instance" v-model="refObj.withCollisions" label="Enable Collider" @change="changeCollisions"></v-switch>
        <div v-if="isAdvancedUser">
          <div class="text-body-1 font-weight-bold">Advanced Features</div>
          <v-text-field v-model="refObj.customId" label="Custom ID" @change="changeId" placeholder="Custom ID"></v-text-field>
          <v-text-field v-model="refObj.parent" label="Parent Entity" dense @change="changeParent" hide-details="true" placeholder="Parent Entity"></v-text-field>
          <v-switch v-model="refObj.customRendering" label="Custom Rendering" :disabled="instance && elementData.customRendering" :messages="customRenderingMessage()" hide-details="auto" @change="changeCustomRendering"></v-switch>
        </div>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="save"> Save </v-btn>
        <v-btn :color="dirty ? 'error' : 'grey darken-1'" text @click="revert"> {{ dirty ? "Revert" : "Cancel" }} </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
export default {
  name: "PropertiesDialog",
  data: () => ({
    original: null,
    dirty: false,
  }),
  mounted() {
    if (this.instance) {
      this.original = { ...this.instanceData };
    } else {
      this.original = { ...this.elementData };
    }
  },
  computed: {
    ...mapGetters({ show: "dialog/propertiesDialogOpen", dialogProps: "dialog/propertiesDialogProps", isAdvancedUser: "user/isAdvancedUser" }),
    instance() {
      return this.dialogProps?.instance;
    },
    instanceData() {
      return this.dialogProps?.instanceData;
    },
    elementData() {
      return this.dialogProps?.elementData;
    },
    element() {
      return this.dialogProps?.element || "";
    },
    refObj() {
      if (this.instance) {
        return this.instanceData;
      } else {
        return this.elementData;
      }
    },
    isTransparent() {
      return this.elementData.isTransparent;
    },
  },
  methods: {
    ...mapActions({ updateSceneElement: "scene/updateSceneElement", showPropertiesDialog: "dialog/showPropertiesDialog", hidePropertiesDialog: "dialog/hidePropertiesDialog" }),
    changeTransparency() {
      this.updateSceneElement({
        elementData: this.elementData,
        instance: !!this.instance,
        property: "isTransparent",
      });
      this.dirty = true;
    },
    changeCollisions() {
      this.updateSceneElement({
        elementData: this.elementData,
        instance: !!this.instance,
        instanceData: this.instanceData,
        property: "withCollisions",
      });
      this.dirty = true;
    },
    changeCustomRendering() {
      this.updateSceneElement({
        elementData: this.elementData,
        instance: !!this.instance,
        instanceData: this.instanceData,
        property: "customRendering",
      });
      this.dirty = true;
    },
    changeParent() {
      this.updateSceneElement({
        elementData: this.elementData,
        instance: !!this.instance,
        instanceData: this.instanceData,
        property: "parent",
      });
      this.dirty = true;
    },
    changeId() {
      this.updateSceneElement({
        elementData: this.elementData,
        instance: this.instance,
        instanceData: this.instanceData,
        property: "customId",
      });
      this.dirty = true;
    },
    customRenderingMessage() {
      let baseEntity;
      if (this.element.includes("image")) {
        baseEntity = "image";
      } else if (this.element.includes("video")) {
        baseEntity = "video";
      }
      if (this.instance && this.elementData?.customRendering) {
        return `Enabled on base ${baseEntity || "element"}`;
      }
    },
    save() {
      this.dirty = false;
      this.hidePropertiesDialog();
    },
    revert() {
      if (this.dirty) {
        this.updateSceneElement({
          elementData: this.elementData,
          instance: this.instance,
          instanceData: this.instanceData,
          property: "properties",
        });
      }
      this.dirty = false;
      this.hidePropertiesDialog();
    },
  },
};
</script>
