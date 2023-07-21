<template>
  <v-dialog v-model="updateHistoryDialog" scrollable width="600px">
    <template v-slot:activator="{ on, attrs }">
      <v-btn color="primary" dark icon x-small v-bind="attrs" v-on="on">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" x-small v-on="on"> mdi-clock </v-icon>
          </template>
          <span>View Update History</span>
        </v-tooltip>
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="text-h5">Update History</span>
      </v-card-title>
      <v-card-text>
        <div v-for="(update, i) in scene.updates" :key="i">
          <div v-if="update.update" class="font-weight-bold">
            {{ update.update.action.capitalize() }}
            {{ update.update.element }} {{ update.update.scene
            }}{{ update.update.elementData && " - "
            }}{{ update.update.elementData && update.update.elementData.name }}
          </div>
          <div v-if="!update.update" class="font-weight-bold">
            Unknown update
          </div>
          <div>
            {{ getDateTime(update.timestamp) }} by
            {{ update.wallet.truncateWallet() }}
          </div>
          <br />
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="gray darken-1" text @click="updateHistoryDialog = false">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "UpdateHistory",
  data: () => ({}),
  props: {
    value: Boolean,
  },

  computed: {
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
    closeWindow() {
      this.enabled = false;
    },
  },
};
</script>
