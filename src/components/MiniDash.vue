<template>
  <div class="d-flex justify-start">
    <v-icon small class="mr-2">{{ icon }}</v-icon>
    <div v-for="(stat, key) in stats" :key="key" class="stat-cell">
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            v-if="stat.icon"
            v-bind="attrs"
            v-on="on"
            small
            class="grey--text"
            :class="stat.text ? 'mr-1' : ''"
            >{{ stat.icon }}</v-icon
          > 
          <div v-if="stat.text" class="grey--text">{{ stat.text }}</div>
        </template>
        <span>{{ stat.tooltip }}</span>
      </v-tooltip>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MiniDash',

  data: () => ({}),
  props: {
    icon: String,
    stats: Array
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
