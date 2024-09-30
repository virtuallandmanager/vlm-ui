<template>
  <v-dialog v-model="enabled" max-width="350" persistent>
    <v-card>
      <v-card-title class="text-h5">{{ title }}</v-card-title>
      <v-card-text>
        <v-text-field :label="localeText('Name')" outlined v-model="name"></v-text-field>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red darken-1" text @click="save">
          {{ buttonText }}
        </v-btn>
        <v-btn color="grey darken-1" text @click="cancel"> {{ localeAction('cancel') }} </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'NameDialog',
  data: () => ({}),
  props: {
    name: { type: String, default: '' },
    buttonText: { type: String, default: 'Save' },
    title: { type: String, default: 'Set Name' },
  },
  mounted() {},
  computed: {
    ...mapGetters({
      localeText: 'i18n/nameDialog',
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
    save() {
      this.enabled = false
      this.$emit('onSave')
    },
    cancel() {
      this.enabled = false
    },
  },
}
</script>
