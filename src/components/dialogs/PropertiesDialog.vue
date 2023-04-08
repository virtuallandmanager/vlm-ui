<template>
  <v-dialog v-model="show" max-width="350" persistent>
    <v-card>
      <v-card-title class="text-h5">
        {{ entityType.capitalize() }} Properties
      </v-card-title>
      <v-card-text>
        <div
          v-if="entityType == 'image' && !instance"
          class="text-body1 font-weight-bold"
        >
          Appearance
        </div>
        <v-switch
          v-if="entityType == 'image' && !instance"
          v-model="refObj.isTransparent"
          label="Enable Transparency"
          @change="changeTransparency"
        ></v-switch>
        <div v-if="instance" class="text-body1 font-weight-bold">
          Interactions
        </div>
        <v-switch
          v-if="instance"
          v-model="refObj.withCollisions"
          label="Enable Collider"
          @change="changeCollisions"
        ></v-switch>
        <div>
          <div class="text-body1 font-weight-bold">Advanced Features</div>
          <v-text-field
            v-model="refObj.customId"
            label="Custom ID"
            @change="changeId"
            placeholder="Custom ID"
          ></v-text-field>
          <v-text-field
            v-model="refObj.parent"
            label="Parent Entity"
            dense
            @change="changeParent"
            hide-details="true"
            placeholder="Parent Entity"
          ></v-text-field>
          <v-switch
            v-model="customRendering"
            label="Custom Rendering"
            :disabled="instance && baseObj.customRendering"
            :messages="customRenderingMessage()"
            hide-details="auto"
            @change="changeCustomRendering"
          ></v-switch>
        </div>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="accenttext" text @click="save"> Save </v-btn>
        <v-btn color="grey darken-1" text @click="revert"> Cancel </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from "vue";
export default {
  name: "PropertiesDialog",
  data: () => ({
    refObj: {},
    baseObj: {},
  }),
  props: {
    title: { type: String, default: "Properties" },
    entity: Object,
    entityType: { type: String, default: "Entity" },
    instance: [Object, null],
    value: Boolean,
  },
  mounted() {
    this.refObj = this.instance || this.entity;
    this.baseObj = { customRendering: false, ...this.entity };
    this.originalProperties = {
      ...this.refObj,
    };
  },
  computed: {
    show: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
    customRendering: {
      get() {
        return this.baseObj.customRendering || this.refObj.customRendering;
      },
      set(value) {
        if (
          (this.instance && !this.baseObj.customRendering) ||
          !this.instance
        ) {
          this.refObj.customRendering = value;
        }
      },
    },
  },
  methods: {
    getRefObj() {
      return this.instance || this.entity;
    },
    changeTransparency() {
      Vue.set(this.refObj, "isTransparent", this.refObj.isTransparent);
      this.$emit("onChange", this.refObj);
    },
    changeCollisions() {
      Vue.set(this.refObj, "withCollisions", this.refObj.withCollisions);
      this.$emit("onChange", this.refObj);
    },
    changeCustomRendering() {
      Vue.set(this.refObj, "customRendering", this.refObj.customRendering);
      this.$emit("onChange", this.refObj);
    },
    changeParent() {
      Vue.set(this.refObj, "parent", this.refObj.parent);
      this.$emit("onChange", this.refObj);
    },
    changeId() {
      Vue.set(this.refObj, "customId", this.refObj.customId);
      this.$emit("onChange", this.refObj);
    },
    customRenderingMessage() {
      let baseEntity;
      if (this.entityType.includes("image")) {
        baseEntity = "image";
      } else if (this.entityType.includes("video")) {
        baseEntity = "video";
      }
      if (this.instance && this.baseObj.customRendering) {
        return `Enabled on base ${baseEntity || "entity"}`;
      }
    },
    save() {
      this.show = false;
      this.$emit("onChange", this.refObj);
    },
    revert() {
      this.show = false;
      Vue.set(
        this.refObj,
        "isTransparent",
        this.originalProperties.isTransparent
      );
      Vue.set(this.refObj, "customId", this.originalProperties.customId);
      Vue.set(this.refObj, "parent", this.originalProperties.parent);
      Vue.set(
        this.refObj,
        "customRendering",
        this.originalProperties.customRendering
      );
      Vue.set(
        this.refObj,
        "withCollisions",
        this.originalProperties.withCollisions
      );
      this.$emit("onChange", this.refObj);
    },
  },
};
</script>
