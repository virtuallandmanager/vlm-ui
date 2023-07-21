<template>
  <v-container fluid>
    <slot name="dialogs"></slot>
    <v-row v-if="$slots.header">
      <v-col cols="12">
        <div class="text-h4 font-weight-light d-flex">
          <slot name="header"></slot>
        </div>
      </v-col>
    </v-row>
    <v-row class="text-center mb-12" v-if="contentLoading">
      <v-col>
        <loader :message="loadingMessage || 'Loading...'" :loading="loading" :grid="true" />
      </v-col>
    </v-row>
    <v-row class="text-center" v-if="noContentLoaded">
      <v-col>
        <div class="pa-4">
          <div class="text-h6"><slot name="no-content-header"></slot></div>
          <div class="text-display py-2">
            <slot name="no-content-text"></slot>
          </div>
          <slot name="no-content-cta"></slot>
        </div>
      </v-col>
    </v-row>
    <slot v-if="hasContent"></slot>
  </v-container>
</template>

<script>
import { mapActions } from "vuex";
import Loader from "./Loader";

export default {
  name: "ContentSubPanel",
  data: () => ({}),
  props: {
    loading: Boolean,
    loadingMessage: String,
    hasContent: Boolean,
  },
  computed: {
    contentLoading() {
      return this.loading;
    },
    noContentLoaded() {
      return !this.hasContent && !this.loading;
    },
  },
  components: { Loader },
  methods: {
    ...mapActions({ toggleNavDrawer: "app/toggleNavDrawer" }),
  },
};
</script>

<style scoped>
.scene-card-link {
  text-decoration: none;
}
.blur {
  backdrop-filter: blur(5px);
  background: rgb(2, 0, 36);
}
</style>
