<template>
  <div v-if="loading">
    <div v-if="!grid">
      <v-progress-circular indeterminate class="my-6"></v-progress-circular>
      <div class="text-body-1">{{ message }}</div>
    </div>
    <v-row class="text-center" v-if="grid">
      <v-col cols="12">
        <v-progress-circular indeterminate class="my-6"></v-progress-circular>
        <div class="text-body-1">{{ message }}</div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'Loader',

  data: () => ({}),
  props: {
    message: String,
    grid: Boolean,
    loading: Boolean,
  },
}
</script>
