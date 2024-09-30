<template>
  <v-dialog v-model="show" width="500" persistent>
    <v-card>
      <v-card-title class="text-h5">
        {{ title }}
      </v-card-title>

      <v-card-text class="pa-4">
        <div v-for="(selection, i) in selections" :key="i" class="d-flex">
          <v-text-field v-model="selection.text" :label="localeText('Selection Name')" class="mr-2" @change="this.$emit('onChange')"></v-text-field>
          <v-text-field v-model="selection.value" :label="localeText('Selection ID')" class="ml-2" @change="this.$emit('onChange')"></v-text-field>
          <v-btn icon @click="removeSelection(i)"><v-icon>mdi-trash-can</v-icon></v-btn>
        </div>
        <div class="text-right">
          <v-btn @click="addSelection()">
            <v-icon>mdi-plus</v-icon>
            {{ localeText('Add Option') }}
          </v-btn>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="accenttext" text @click.stop="save"> {{ localeAction('save') }} </v-btn>
        <v-btn color="grey darken-1" text @click.stop="revert"> {{ localeAction('Cancel') }} </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'EditSelectDialog',
  data: () => ({
    originalSelections: [],
  }),
  props: {
    title: { type: String, default: 'Edit Selections' },
    selections: Array,
    value: Boolean,
  },
  mounted() {
    this.originalSelections = this.selections
  },
  computed: {
    ...mapGetters({
      localeText: 'i18n/editSelectDialog',
      localeAction: 'i18n/actions',
    }),
    show: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      },
    },
  },
  methods: {
    addSelection() {
      this.selections.push({
        text: `Option ${this.selections.length}`,
        value: `option-${this.selections.length}`,
      })
    },
    removeSelection(i) {
      this.selections.splice(i, 1)
    },
    save() {
      this.show = false
      this.$emit('onChange')
    },
    revert() {
      this.selections = this.originalSelections
      this.show = false
      this.$emit('onChange')
    },
  },
}
</script>
