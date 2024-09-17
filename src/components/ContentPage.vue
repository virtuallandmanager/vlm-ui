<template>
  <v-sheet color="rgba(50, 50, 80, 0.5)" elevation="3" class="pa-2 blur flex-grow-1 fill-height">
    <v-container fluid>
      <v-row>
        <v-col class="d-flex align-center" :class="centerContent ? 'justify-center' : 'justify-space-between'">
          <div class="text-h2 font-weight-light mb-3">
            <slot name="header"></slot>
          </div>
          <div class="mb-3">
            <slot name="header-actions"></slot>
          </div>
        </v-col>
      </v-row>
      <template v-if="!contentLoading && $slots['contextual-content']">
        <v-row class="text-center">
          <v-col>
            <slot name="contextual-content"></slot>
          </v-col>
        </v-row>
      </template>
      <v-row class="text-center mb-12" v-if="contentLoading">
        <v-col>
          <loader :message="loadingMessage || localeAction('loading')" :loading="loading" :grid="true" />
        </v-col>
      </v-row>
      <v-row class="text-center" v-if="noContentLoaded">
        <v-col>
          <div class="pa-4">
            <div class="text-h6">
              <slot name="no-content-header"></slot>
            </div>
            <div class="text-display py-2">
              <slot name="no-content-text"></slot>
            </div>
            <slot name="no-content-cta"></slot>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <slot v-if="hasContent"></slot>
  </v-sheet>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Loader from './Loader'

export default {
  name: 'ContentPage',
  data: () => ({}),
  props: {
    loading: Boolean,
    loadingMessage: String,
    noContent: Boolean,
    centerContent: Boolean,
  },
  components: { Loader },
  computed: {
    ...mapGetters({ localeAction: 'i18n/actions' }),
    hasContent() {
      return !this.noContent && !this.loading
    },
    contentLoading() {
      return !this.noContent && this.loading
    },
    noContentLoaded() {
      return this.noContent && !this.loading
    },
    authenticated() {
      return this.$store.getters['auth/authenticated']
    },
    navDrawerState() {
      return this.$store.state.app.navDrawerOpen
    },
  },
  methods: {
    ...mapActions({ toggleNavDrawer: 'app/toggleNavDrawer' }),
  },
}
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
