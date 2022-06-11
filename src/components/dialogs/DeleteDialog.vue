<template>
  <v-dialog v-model="show" max-width="350">
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        Remove {{ entityType.capitalize() }}
      </v-card-title>
      <v-card-text v-if="!text" class="pt-4">
        Are you sure you want to remove
        {{ removeAll ? 'all instances of' : '' }}
        {{ entity.name || `this ${entityType}` }} from the scene?
      </v-card-text>
      <v-card-text v-else class="pt-4">
        {{ text }}
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red darken-1" text @click="remove">
          {{ buttonText }}
        </v-btn>
        <v-btn color="grey darken-1" text @click="cancel"> Cancel </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'DeleteDialog',
  data: () => ({}),
  props: {
    buttonText: { type: String, default: 'Remove' },
    entity: [Object, String],
    entityType: { type: String, default: 'entity' },
    removeAll: { type: Boolean, default: false },
    value: Boolean,
    text: String
  },
  mounted () {},
  computed: {
    show: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('input', value)
      }
    }
  },
  methods: {
    remove () {
      this.show = false
      this.$emit('onRemove')
    },
    cancel () {
      this.show = false
    }
  }
}
</script>
