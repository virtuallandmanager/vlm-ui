<template>
  <v-container>
    <div
      v-for="(axis, key) in xyz"
      :key="key"
      class="text-center"
      style="height: 50px"
    >
      <v-row v-if="key !== 'z' || value !== 'scale' || !isPlane" no-gutters>
        <v-col class="text-right px-0">
          <v-btn tile class="px-0" height="38" @click="decrement(key)">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </v-col>
        <v-col class="px-0">
          <v-text-field
            type="number"
            :value="xyz[key]"
            :label="getLabel(key)"
            outlined
            dense
            hide-details="true"
            width="100px"
            class="axis"
            hide-spin-buttons
            @change="value => directUpdate(key, value)"
          ></v-text-field>
        </v-col>
        <v-col class="px-0 text-left">
          <v-btn tile class="px-0" height="38" @click="increment(key)">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </div>
    <v-row class="text-center">
      <v-col class="text-center pa-2">
        {{ multiplierText }}
      </v-col>
    </v-row>
    <v-row class="text-center px-10">
      <v-col
        cols="4"
        class="text-center pt-0 px-1"
        v-for="(multiplierText, i) in multipliers"
        :key="i"
      >
        <v-btn
          :outlined="multiplierIndex == i"
          small
          block
          @click="setMultiplier(i)"
        >
          {{ multiplierText }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'XYZButtons',

  data: () => ({
    multiplierIndexes: {
      position: 1,
      scale: 1,
      rotation: 1
    }
  }),
  props: {
    value: {
      type: String,
      default: 'scale'
    },
    isPlane: { type: Boolean, default: false },
    xyz: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 }
    }
  },
  computed: {
    multiplierIndex: {
      get () {
        return this.multiplierIndexes[this.value]
      },
      set (newValue) {
        this.multiplierIndexes[this.value] = newValue
      }
    },
    multipliers () {
      if (this.value == 'rotation') {
        return [90, 45, 22.5, 10, 5, 1]
      } else if (this.value == 'scale') {
        return [10, 2, 1.5, 1.1, 1.01, 1.001]
      } else {
        return [10, 1, 0.1, 0.01, 0.001, 0.0001]
      }
    },
    multiplierText () {
      switch (this.value) {
        case 'position':
          return 'Move by:'
        case 'scale':
          return 'Scale by:'
        case 'rotation':
          return 'Rotate by:'
        default:
          return ''
      }
    }
  },
  methods: {
    getLabel (key) {
      if (!this.isPlane) {
        return key.toUpperCase()
      } else if (key == "x") {
        return "W"
      } else if (key == "y") {
        return "H"
      }
    },
    roundToStep (value, stepParam) {
      var step = stepParam || 1.0
      var inv = 1.0 / step
      return Math.round(value * inv) / inv
    },
    increment (key) {
      let newValue
      if (this.value == 'scale') {
        newValue =
          parseFloat(this.xyz[key]) * this.multipliers[this.multiplierIndex]
      } else {
        newValue =
          parseFloat(this.xyz[key]) + this.multipliers[this.multiplierIndex]
      }
      this.xyz[key] = this.roundToStep(newValue, 0.001)
      this.onChange()
    },
    decrement (key) {
      let newValue
      if (this.value == 'scale') {
        newValue =
          parseFloat(this.xyz[key]) / this.multipliers[this.multiplierIndex]
      } else {
        newValue =
          parseFloat(this.xyz[key]) - this.multipliers[this.multiplierIndex]
      }
      this.xyz[key] = this.roundToStep(newValue, 0.001)
      this.onChange()
    },
    directUpdate (key, value) {
      this.xyz[key] = parseFloat(value) || 0
      this.onChange()
    },
    setMultiplier (i) {
      this.multiplierIndex = i
    },
    onChange () {
      this.$emit('onChange')
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
</style>
