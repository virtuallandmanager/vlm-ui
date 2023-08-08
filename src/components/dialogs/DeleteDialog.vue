<template>
  <v-dialog v-model="show" max-width="350">
    <v-card>
      <v-card-title class="text-h5"> Remove {{ title || instanceData?.name || elementData.name || "Element" }}
      </v-card-title>
      <v-card-text v-if="!text" class="pt-4">
        Are you sure you want to remove
        {{ removeAll ? "all instances of" : "" }}
        {{ instanceData?.name || elementData.name || `this ${element}` }} from the scene?
      </v-card-text>
      <v-card-text v-else class="pt-4">
        {{ text }}
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red darken-1" text @click="remove">
          {{ buttonText }}
        </v-btn>
        <v-btn color="grey darken-1" text @click="cancel"> Cancel </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from 'vue';
import { mapActions, mapGetters } from "vuex";
export default {
  name: "DeleteDialog",
  data: () => ({}),
  props: {
    value: Boolean,
  },
  computed: {
    ...mapGetters({ show: "dialog/deleteDialogOpen", dialogProps: "dialog/deleteDialogProps" }),
    element() {
      return this.dialogProps.element;
    },
    elementData() {
      return this.dialogProps.elementData;
    },
    instanceData() {
      return this.dialogProps.instanceData;
    },
    buttonText() {
      return this.dialogProps.buttonText || "Remove";
    },
    text() {
      return this.dialogProps.text;
    },
    removeAll() {
      return this.dialogProps.removeAll;
    },
    title() {
      return this.dialogProps.title;
    },
  },
  methods: {
    ...mapActions({ deleteSceneElement: "scene/deleteSceneElement", showDeleteDialog: "dialog/showDeleteDialog", hideDeleteDialog: "dialog/hideDeleteDialog" }),
    cancel() {
      this.hideDeleteDialog();
    },
    remove() {
      const { element, elementData, instanceData, instance } = this.dialogProps;
      const id = instance ? instanceData?.sk : elementData?.sk;
      if (instance) {
        const index = elementData.instances.findIndex((i) => i.sk === id);
        Vue.delete(elementData.instances, index);
      }
      this.deleteSceneElement({ element, elementData, instanceData, instance, id });
      this.hideDeleteDialog();
    },
  },
};
</script>
