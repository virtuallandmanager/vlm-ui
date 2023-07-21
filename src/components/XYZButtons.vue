<template>
  <v-container>
    <div v-for="(axis, key) in xyz" :key="key" class="text-center" style="height: 50px">
      <v-row v-if="key !== 'z' || value !== 'scale' || !isPlane" no-gutters>
        <v-col class="text-right px-0">
          <v-tooltip left>
            <template v-slot:activator="{ on, attrs }">
              <v-btn tile class="px-0" height="38" @click="decrement(key)" v-bind="attrs" v-on="on">
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
            </template>
            <span>{{ value !== "scale" ? `${xyz[key] - multipliers[multiplierIndex]}` : `${xyz[key] / multipliers[multiplierIndex]}` }}</span>
          </v-tooltip>
        </v-col>
        <v-col class="px-0">
          <v-text-field type="number" :value="xyz[key]" :label="getLabel(key)" outlined dense hide-details="true" width="100px" class="axis" hide-spin-buttons @change="(value) => directUpdate(key, value)"></v-text-field>
        </v-col>
        <v-col class="px-0 text-left">
          <v-tooltip right>
            <template v-slot:activator="{ on, attrs }">
              <v-btn tile class="px-0" height="38" @click="increment(key)" v-bind="attrs" v-on="on">
                <v-icon>mdi-chevron-right</v-icon>
              </v-btn>
            </template>
            <span>{{ value !== "scale" ? `${xyz[key] + multipliers[multiplierIndex]}` : `${xyz[key] * multipliers[multiplierIndex]}` }}</span>
          </v-tooltip>
        </v-col>
        <v-col class="text-center pa-2 col-6" v-if="value == 'scale' && key == 'y'">n * 1/{{ multipliers[multiplierIndex] }} </v-col>
        <v-col class="text-center pa-2 col-6" v-if="value == 'scale' && key == 'y'">n * {{ multipliers[multiplierIndex] }} </v-col>
      </v-row>
    </div>
    <v-row>
      <v-col>
        <v-btn v-if="value == 'scale'" :outlined="!lockWidthAndDepth" :color="lockWidthAndDepth ? 'primary' : 'grey'" class="mt-2" max-width="250" @click="lockWidthAndDepth = !lockWidthAndDepth"
          ><v-icon small class="mr-2">mdi-lock</v-icon> Aspect Ratio</v-btn
        >
        <v-btn v-if="value == 'position'" :outlined="!lockWidthAndDepth" :color="lockWidthAndDepth ? 'primary' : 'grey'" class="mt-2" max-width="250" @click="lockWidthAndDepth = !lockWidthAndDepth"
          ><v-icon small class="mr-2">mdi-lock</v-icon> Move Diagonally</v-btn
        >
      </v-col>
    </v-row>
    <v-row class="text-center">
      <v-col class="text-center pa-2">
        {{ multiplierText }}
      </v-col>
    </v-row>
    <v-row class="text-center px-10">
      <v-col cols="4" class="text-center pt-0 px-1" v-for="(multiplierVal, i) in multipliers" :key="i">
        <v-btn :outlined="multiplierIndex == i" small block @click="setMultiplier(i)">{{ multiplierValues[i] }} </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Vue from "vue";
export default {
  name: "XYZButtons",

  data: () => ({
    multiplierIndexes: {
      position: 1,
      scale: 1,
      rotation: 1,
    },
    lockWidthAndDepth: true,
  }),
  props: {
    value: {
      type: String,
      default: "scale",
    },
    isPlane: { type: Boolean, default: false },
    xyz: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 },
    },
  },
  watch: {
    value(newVal) {
      this.lockWidthAndDepth = newVal == "scale";
    },
  },
  computed: {
    multiplierIndex: {
      get() {
        return this.multiplierIndexes[this.value];
      },
      set(newValue) {
        this.multiplierIndexes[this.value] = newValue;
      },
    },
    multipliers() {
      if (this.value == "rotation") {
        return [90, 45, 22.5, 10, 5, 1];
      } else if (this.value == "scale") {
        return [10, 2, 1.5, 1.1, 1.01, 1.001];
      } else {
        return [10, 1, 0.5, 0.1, 0.01, 0.001];
      }
    },
    multiplierValues() {
      if (this.value == "rotation") {
        return [90, 45, 22.5, 10, 5, 1];
      } else if (this.value == "scale") {
        return ["10x", "2x", "1.5x", "1.1x", "1.01x", "1.001x"];
      } else {
        return ["10m", "1m", "0.5m", "0.1m", "1cm", "1mm"];
      }
    },
    multiplierText() {
      switch (this.value) {
        case "position":
          return "Move by:";
        case "scale":
          return "Scale by:";
        case "rotation":
          return "Rotate by:";
        default:
          return "";
      }
    },
  },
  methods: {
    getLabel(key) {
      if (!this.isPlane || this.value !== "scale") {
        return key.toUpperCase();
      } else if (key == "x" && this.value == "scale") {
        return "W";
      } else if (key == "y" && this.value == "scale") {
        return "H";
      }
    },
    getNextVal(key, multiplierVal) {
      if (this.value == "scale") {
        return key * multiplierVal;
      } else if (this.value == "rotation" || this.value == "position") {
        return key + multiplierVal;
      }
    },
    roundToStep(value, stepParam) {
      var step = stepParam || 1.0;
      var inv = 1.0 / step;
      return Math.round(value * inv) / inv;
    },
    increment(key) {
      let newValue;
      if (this.lockWidthAndDepth && this.value == "scale") {
        newValue = parseFloat(this.xyz.x) * this.multipliers[this.multiplierIndex];
        Vue.set(this.xyz, "x", this.roundToStep(newValue, 0.001));
        newValue = parseFloat(this.xyz.y) * this.multipliers[this.multiplierIndex];
        Vue.set(this.xyz, "y", this.roundToStep(newValue, 0.001));
        newValue = parseFloat(this.xyz.z) * this.multipliers[this.multiplierIndex];
        Vue.set(this.xyz, "z", this.roundToStep(newValue, 0.001));
        this.onChange();
        return;
      } else if (this.value == "scale") {
        newValue = parseFloat(this.xyz[key]) * this.multipliers[this.multiplierIndex];
      } else if (key !== "y" && this.value == "position" && this.lockWidthAndDepth) {
        newValue = parseFloat(this.xyz.x) + this.multipliers[this.multiplierIndex];
        Vue.set(this.xyz, "x", this.roundToStep(newValue, 0.001));
        newValue = parseFloat(this.xyz.z) + this.multipliers[this.multiplierIndex];
        Vue.set(this.xyz, "z", this.roundToStep(newValue, 0.001));
        this.onChange();
        return;
      } else {
        newValue = parseFloat(this.xyz[key]) + this.multipliers[this.multiplierIndex];
      }
      Vue.set(this.xyz, key, this.roundToStep(newValue, 0.001));
      this.onChange();
    },
    decrement(key) {
      let newValue;
      if (this.lockAspectRatio && this.value == "scale") {
        newValue = parseFloat(this.xyz.x) / this.multipliers[this.multiplierIndex];
        Vue.set(this.xyz, "x", this.roundToStep(newValue, 0.001));
        newValue = parseFloat(this.xyz.y) / this.multipliers[this.multiplierIndex];
        Vue.set(this.xyz, "y", this.roundToStep(newValue, 0.001));
        newValue = parseFloat(this.xyz.z) / this.multipliers[this.multiplierIndex];
        Vue.set(this.xyz, "z", this.roundToStep(newValue, 0.001));
        this.onChange();
        return;
      } else if (this.value == "scale") {
        newValue = parseFloat(this.xyz[key]) / this.multipliers[this.multiplierIndex];
      } else if (key !== "y" && this.value == "position" && this.lockWidthAndDepth) {
        newValue = parseFloat(this.xyz.x) - this.multipliers[this.multiplierIndex];
        Vue.set(this.xyz, "x", this.roundToStep(newValue, 0.001));
        newValue = parseFloat(this.xyz.z) - this.multipliers[this.multiplierIndex];
        Vue.set(this.xyz, "z", this.roundToStep(newValue, 0.001));
        this.onChange();
        return;
      } else {
        newValue = parseFloat(this.xyz[key]) - this.multipliers[this.multiplierIndex];
      }
      Vue.set(this.xyz, key, this.roundToStep(newValue, 0.001));
      this.onChange();
    },
    directUpdate(key, value) {
      this.xyz[key] = parseFloat(value) || 0;
      this.onChange();
    },
    setMultiplier(i) {
      this.multiplierIndex = i;
    },
    onChange() {
      this.$emit("onChange");
    },
  },
};
</script>

<style>
v-text-field.axis {
  text-align: center !important;
}

.axis input[type="number"] {
  appearance: textfield;
  -moz-appearance: textfield;
  text-align: center !important;
}
</style>
