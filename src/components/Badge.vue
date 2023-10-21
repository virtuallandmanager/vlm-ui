<template>
  <v-card class="vlm-badge text-left pa-2 grey">
    <v-avatar color="yellow darken-2">
      <v-icon>{{ icon }}</v-icon>
    </v-avatar>
    <div class="content">
      <div class="badge-title black--text">{{ title }}</div>
      <div class="badge-description grey--text text--darken-4">{{ description }}</div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: "Badge",

  data: () => ({}),
  props: {
    icon: String,
    title: String,
    description: String,
  },
};
</script>

<style scoped>
.vlm-badge {
  display: flex;
  align-items: center;
}

.content {
  margin-left: 10px;
}

.badge-title {
  font-weight: bold;
}

.badge-description {
  font-size: 0.9em;
  color: grey;
}
</style>