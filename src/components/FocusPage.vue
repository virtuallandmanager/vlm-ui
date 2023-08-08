<template>
  <v-sheet color="rgba(50, 50, 80, 0.5)" elevation="3" class="blur fill-height">
    <v-img :src="imageLink" max-height="168" class="d-flex justify-stretch">
      <div class="d-flex justify-end ma-2">
        <slot name="header-actions"></slot>
      </div>
      <div class="d-flex justify-end flex-column justify-end align-center fill-height" v-if="$slots.header">
        <div class="d-flex justify-center flex-column page-header">
          <div class="text-h4 font-weight-light">
            <slot name="header"></slot>
          </div>
        </div>
      </div>
    </v-img>
    <v-container fluid class="pa-4">
      <v-row class="text-center" v-if="contentLoading">
        <v-col>
          <loader :message="loadingMessage || 'Loading...'" :loading="loading" :grid="true" />
        </v-col>
      </v-row>
      <v-row class="text-center" v-if="noContentLoaded">
        <v-col>
          <div class="pa-4">
            <div class="text-h6"><slot name="no-content-header"></slot></div>
            <div class="text-display">
              <slot name="no-content-text"></slot>
            </div>
            <slot name="no-content-cta"></slot>
          </div>
        </v-col>
      </v-row>
      <v-row v-if="hasContent">
        <v-col>
          <slot></slot>
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
</template>

<script>
import { mapActions } from "vuex";
import Loader from "./Loader";

export default {
  name: "FocusPage",
  data: () => ({}),
  props: {
    loading: Boolean,
    loadingMessage: String,
    noContent: Boolean,
    imageLink: String,
  },
  computed: {
    hasContent() {
      return !this.noContent && !this.loading;
    },
    contentLoading() {
      return !this.noContent && this.loading;
    },
    noContentLoaded() {
      return this.noContent && !this.loading;
    },
    authenticated() {
      return this.$store.getters["auth/authenticated"];
    },
    navDrawerState() {
      return this.$store.state.app.navDrawerOpen;
    },
  },
  components: { Loader },
  methods: {
    ...mapActions({ toggleNavDrawer: "app/toggleNavDrawer" }),
  },
};
</script>

<style>
.scene-card-link {
  text-decoration: none;
}
.blur {
  backdrop-filter: blur(5px);
  background: rgb(2, 0, 36);
}

.page-header {
  padding: 24px 48px;
  backdrop-filter: blur(5px);
  background: rgba(2, 0, 36, 0.5);
  border-radius: 25px 25px 0 0;
  max-width: 90vw;
}
</style>
