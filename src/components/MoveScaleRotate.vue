<template>
  <div>
    <v-tabs v-model="mode" centered icons-and-text color="nav">
      <v-tabs-slider></v-tabs-slider>
      <v-tab href="#position">
        {{ localeAction('position') }}
        <v-icon>mdi-axis-arrow</v-icon>
      </v-tab>
      <v-tab href="#scale">
        {{ localeAction('scale') }}
        <v-icon>mdi-resize</v-icon>
      </v-tab>
      <v-tab href="#rotation">
        {{ localeAction('rotation') }}
        <v-icon>mdi-rotate-360</v-icon>
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="mode" class="mx-auto">
      <v-tab-item :value="mode" class="text-center mt-2">
        <x-y-z-buttons :xyz="instanceData[mode]" :value="mode" :isPlane="isPlane" @onChange="onChange" class="mx-auto" />
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import XYZButtons from './XYZButtons.vue'
import { mapGetters } from 'vuex'
import Vue from 'vue'
export default {
  components: { XYZButtons },
  name: 'MoveScaleRotate',

  data: () => ({
    mode: 'position',
  }),
  props: {
    instanceData: {
      position: {
        x: Number,
        y: Number,
        z: Number,
      },
      scale: {
        x: Number,
        y: Number,
        z: Number,
      },
      rotation: {
        x: Number,
        y: Number,
        z: Number,
      },
    },
    isPlane: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters({
      localeAction: 'i18n/actions',
    }),
  },
  methods: {
    onChange() {
      Vue.set(this.instanceData, this.mode, { ...this.instanceData[this.mode] })
      this.$emit('onChange')
    },
  },
}
</script>
