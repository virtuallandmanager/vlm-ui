<template>
  <v-dialog v-model="show" width="500" @click:outside="revert">
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        {{ title }}
      </v-card-title>

      <v-card-text class="pa-4">
        <div v-for="(selection, i) in selections" :key="i" class="d-flex">
          <v-text-field
            v-model="selection.text"
            label="Selection Name"
            class="mr-2"
            @change="this.$emit('onChange')"
          ></v-text-field>
          <v-text-field
            v-model="selection.value"
            label="Selection ID"
            class="ml-2"
            @change="this.$emit('onChange')"
          ></v-text-field>
          <v-btn icon @click="removeSelection(i)"
            ><v-icon>mdi-trash-can</v-icon></v-btn
          >
        </div>
        <div align="right">
          <v-btn @click="addSelection()">
            <v-icon>mdi-plus</v-icon>
            Add Option
          </v-btn>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click.stop="save"> Save </v-btn>
        <v-btn color="error" text @click.stop="revert"> Cancel </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'EditSelectDialog',
  data: () => ({
    originalSelections: []
  }),
  props: {
    title: { type: String, default: 'Edit Selections' },
    selections: Array,
    value: Boolean
  },
  mounted () {
    this.originalSelections = this.selections
  },
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
    addSelection () {
      this.selections.push({
        text: `Option ${this.selections.length}`,
        value: `option-${this.selections.length}`
      })
    },
    removeSelection (i) {
      this.selections.splice(i, 1)
    },
    save () {
      this.show = false
      this.$emit('onChange')
    },
    revert () {
      this.selections = this.originalSelections
      this.show = false
      this.$emit('onChange')
    }
  }
}
</script>
