<template>
  <div class="d-flex justify-start">
    <v-icon small class="mr-2">{{ icon }}</v-icon>
    <div v-for="(value, key) in stats" :key="key" class="stat-cell">
      <strong class="label grey--text">{{ key.toUpperCase() }}</strong>
      {{ value }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'MiniStat',

  data: () => ({}),
  props: {
    icon: String,
    stats: Object
  }
}
</script>

<style lang="scss" scoped>
.stat-cell {
  display: flex;
  flex-direction: row;
  font-size: 0.75em;
  padding: 4px 8px;
}
.label {
  margin-right: 4px;
}
</style>
