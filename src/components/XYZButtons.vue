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
          :value="xyz[key]"
          :label="key.toUpperCase()"
          outlined
          dense
          hide-details="true"
          width="100px"
          class="axis"
          @input="value => directUpdate(key, value)"
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
  <!-- <div class="text-center">
      <span class="text-h6 mr-6">Y</span>
      <v-btn tile><v-icon>mdi-chevron-left</v-icon></v-btn>
      <v-btn disabled tile min-width="100">{{ xyz.y || 0 }}</v-btn>
      <v-btn tile><v-icon>mdi-chevron-right</v-icon></v-btn>
    </div>
    <div class="text-center">
      <span class="text-h6 mr-6">Z</span>
      <v-btn tile><v-icon>mdi-chevron-left</v-icon></v-btn>
      <v-btn disabled tile min-width="100">{{ xyz.z || 0 }}</v-btn>
      <v-btn tile><v-icon>mdi-chevron-right</v-icon></v-btn>
    </div>
    <div class="text-center">
      <v-btn full-width tile @click="nextMultiplier">{{
        multipliers[multiplierIndex]
      }}</v-btn>
    </div>
  </div> -->
</template>

<script>
export default {
  name: 'XYZButtons',

  data: () => ({
    multiplierIndex: 0,
    multipliers: [1, 0.1, 0.01, 0.001],
    originalXyz: { x: 0, y: 0, z: 0 }
  }),
  props: {
    xyz: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 }
    }
  },

  methods: {
    increment (key) {
      this.xyz[key] = +(
        this.xyz[key] + this.multipliers[this.multiplierIndex]
      ).toFixed(4)
      this.updateProperties()
    },
    decrement (key) {
      this.xyz[key] = +(
        this.xyz[key] - this.multipliers[this.multiplierIndex]
      ).toFixed(4)
      this.updateProperties()
    },
    directUpdate (key, value) {
      this.xyz[key] = +value
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

<style scoped>
v-text-field.axis {
  text-align: center !important;
}
</style>
