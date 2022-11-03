<template>
  <div>
    <div class="d-flex pa-6 mx-auto align-baseline justify-space-between">
      <div class="text-h5">Customizations</div>
      <v-btn @click="addCustomization()">Add Customization</v-btn>
    </div>
    <v-row v-if="customizations && customizations.length < 1" class="mt-6">
      <v-col cols="12">
        <div class="text-body1 text-center">
          There are no customizations for this scene
        </div>
      </v-col>
    </v-row>
    <div v-for="(customization, i) of customizations" :key="i">
      <scene-customization
        :customization="customization"
        @updateProperties="updateProperties"
        @onRemove="removeCustomization(i)"
      />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import SceneCustomization from './SceneCustomization'

export default {
  name: 'SceneCustomizationList',
  components: { SceneCustomization },
  data: () => ({
    defaultCustomization: {
      type: 0,
      id: '',
      name: 'New Customization',
      value: false,
      selections: [
        { text: 'Option 1', value: 'option-1' },
        { text: 'Option 2', value: 'option-2' },
        { text: 'Option 3', value: 'option-3' }
      ]
    }
  }),
  props: {
    customizations: {
      type: Array
    }
  },
  mounted () {},
  computed: {},
  methods: {
    addCustomization () {
      const newCustomization = {
        ...this.defaultCustomization,
        name: `Customization ${this.customizations.length + 1}`,
        id: `customization-${this.customizations.length + 1}`
      }
      this.customizations.push({ ...newCustomization })
    },
    removeCustomization (i) {
      const customizationId = this.customizations[i].id
      Vue.delete(this.customizations, i)
      this.updateProperties({
        action: 'delete',
        entity: 'customization',
        id: customizationId
      })
    },
    updateProperties (wssMessages) {
      this.$emit('updateProperties', { wssMessages })
    }
  }
}
</script>
