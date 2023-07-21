<template>
  <v-dialog v-model="enabled" max-width="350" persistent>
    <v-card>
      <v-card-title>Giveaway</v-card-title>
      <v-card-subtitle>
        {{ subtitle }}
      </v-card-subtitle>
      <v-card-text> 
        
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="accenttext" text @click="save"> Save </v-btn>
        <v-btn color="red darken-1" text @click="revert"> Revert </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from "vue";

export default {
  name: "GiveawayDialog",
  data: () => ({}),
  props: {
    giveaway: Object,
    event: Object | null,
  },
  mounted() {

  },
  computed: {
    subtitle() {
      return this.giveaway.name;
    },
    show: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
  },
  methods: {
    save() {
      this.enabled = false;
      this.onChange();
    },
    revert() {
      this.enabled = false;
      this.onChange();
    },
    onChange() {
      this.$emit("onChange");
    },
  },
};
</script>
