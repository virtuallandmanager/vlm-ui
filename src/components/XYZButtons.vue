<template>
  <v-container>
    <v-row
      v-for="(axis, key) in xyz"
      :key="key"
      :v-bind="axis"
      class="text-center"
    >
      <v-col class="text-right px-0">
        <v-btn tile class="px-0" @click="decrement(key)"
          ><v-icon>mdi-chevron-left</v-icon></v-btn
        >
      </v-col>
      <v-col class="px-0">
        <v-text-field
          type="number"
          :value="xyz[key]"
          :label="key.toUpperCase()"
          outlined
          dense
          hide-details="true"
          width="100px"
          class="axis"
          @change="value => directUpdate(key, value)"
        ></v-text-field>
      </v-col>
      <v-col class="px-0 text-left">
        <v-btn tile class="px-0" @click="increment(key)"
          ><v-icon>mdi-chevron-right</v-icon></v-btn
        >
      </v-col>
    </v-row>
    <v-row class="text-center pa-0">
      <v-col class="text-center pa-0">
        Move By:
      </v-col>
    </v-row>
    <v-row class="text-center">
      <v-col class="text-center pt-0">
        <v-btn @click="nextMultiplier">
          {{ multipliers[multiplierIndex] }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// import _cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'XYZButtons',

  data: () => ({
    multiplierIndex: 0,
    multipliers: [1, 0.1, 0.01, 0.001]
  }),
  props: {
    xyz: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 }
    }
  },

  methods: {
    roundToStep (value, stepParam) {
      var step = stepParam || 1.0
      var inv = 1.0 / step
      return Math.round(value * inv) / inv
    },
    increment (key) {
      const newValue =
        parseFloat(this.xyz[key]) + this.multipliers[this.multiplierIndex]
      this.xyz[key] = this.roundToStep(newValue, 0.001)
      this.updateProperties()
    },
    decrement (key) {
      const newValue =
        parseFloat(this.xyz[key]) - this.multipliers[this.multiplierIndex]
      this.xyz[key] = this.roundToStep(newValue, 0.001)
      this.updateProperties()
    },
    directUpdate (key, value) {
      this.xyz[key] = parseFloat(value) || 0
      this.updateProperties()
    },
    nextMultiplier () {
      if (this.multiplierIndex == this.multipliers.length - 1) {
        this.multiplierIndex = 0
        return
      }
      this.multiplierIndex++
    },
    updateProperties () {
      this.$emit('updateProperties')
    }
  }
}
</script>

<style>
v-text-field.axis {
  text-align: center !important;
}

.axis input[type='number'] {
  -moz-appearance: textfield;
  text-align: center !important;
}
.axis input::-webkit-outer-spin-button,
.axis input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
</style>
