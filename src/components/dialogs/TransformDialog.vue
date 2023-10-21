<template>
  <v-dialog v-if="show" v-model="show" max-width="375" persistent>
    <v-card>
      <v-card-title>Move, Scale, Rotate</v-card-title>
      <v-card-subtitle>
        {{ subtitle }}
      </v-card-subtitle>
      <v-card-text>
        <move-scale-rotate :instanceData="instanceData || elementData" @onChange="onChange"
          :isPlane="element == 'image' || element == 'video'" />
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="save"> Save </v-btn>
        <v-btn :color="dirty ? 'red' : 'grey'" text @click="revert">{{ dirty ? "Revert" : "Cancel" }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from "vue";
import MoveScaleRotate from "../MoveScaleRotate";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "TransformDialog",
  components: { MoveScaleRotate },
  data: () => ({
    dirty: false,
    originalInstance: null,
    originalElement: null,
  }),
  props: {
    value: Boolean,
  },
  mounted() {
    this.dirty = false;
    this.originalInstance = this.dialogProps?.instanceData;
  },
  watch: {
    instanceData() {
      if (!this.originalInstance && !this.dirty) {
        this.originalInstance = this.dialogProps?.instanceData;
      }
    },
    elementData() {
      if (!this.originalElement && !this.dirty) {
        this.originalElement = this.dialogProps?.elementData;
      }
    },
  },
  computed: {
    ...mapGetters({ show: "dialog/transformDialogOpen", dialogProps: "dialog/transformDialogProps" }),
    subtitle() {
      return this.dialogProps?.title;
    },
    instanceData() {
      return this.dialogProps?.instanceData;
    },
    elementData() {
      return this.dialogProps?.elementData;
    },
    element() {
      return this.dialogProps?.element;
    },
    id() {
      return this.instanceData ? this.instanceData.id : this.elementData?.sk;
    },
  },
  methods: {
    ...mapActions({ updateSceneElement: "scene/updateSceneElement", showTransformDialog: "dialog/showTransformDialog", hideTransformDialog: "dialog/hideTransformDialog" }),
    onChange() {
      this.dirty = true;
      this.updateSceneElement({
        property: "transform",
        element: this.element,
        elementData: this.elementData,
        instance: this.instanceData ? true : false,
        id: this.id,
        instanceData: this.instanceData,
      });
    },
    save() {
      this.dirty = false;
      this.hideTransformDialog();
    },
    revert() {
      if (this.dirty && this.elementData && !this.instanceData) {
        this.dirty = false;
        Vue.set(this.dialogProps, "elementData", this.originalElement);
        this.updateSceneElement({
          property: "transform",
          element: this.element,
          elementData: this.originalElement,
          id: this.instanceData?.sk,
        });
      } else if (this.dirty && this.elementData && this.instanceData) {
        this.dirty = false;
        Vue.set(this.dialogProps, "instanceData", this.originalInstance);
        this.updateSceneElement({
          property: "transform",
          element: this.element,
          elementData: this.elementData,
          instance: true,
          id: this.instanceData?.sk,
          instanceData: this.originalInstance,
        });
      }

      this.hideTransformDialog();
    },
  },
};
</script>
