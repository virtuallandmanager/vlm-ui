<template>
  <v-dialog v-model="show" max-width="350">
    <v-card>
      <v-card-title class="text-h5"> {{ localeAction('remove') }} {{ title || instanceData?.name || elementData.name || 'Element' }} </v-card-title>
      <v-card-text v-if="!text" class="pt-4">
        {{ message }}
      </v-card-text>
      <v-card-text v-else class="pt-4">
        {{ text }}
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red darken-1" text @click="remove">
          {{ localeAction(buttonText.toLowerCase()) || localeAction('confirm') }}
        </v-btn>
        <v-btn color="grey darken-1" text @click="cancel"> {{ localeAction('Cancel') }} </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from 'vue'
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'DeleteDialog',
  data: () => ({}),
  props: {
    value: Boolean,
  },
  computed: {
    ...mapGetters({
      show: 'dialog/deleteDialogOpen',
      dialogProps: 'dialog/deleteDialogProps',
      localeAction: 'i18n/actions',
      localeText: 'i18n/deleteDialog',
    }),
    element() {
      return this.dialogProps.element
    },
    elementData() {
      return this.dialogProps.elementData
    },
    instanceData() {
      return this.dialogProps.instanceData
    },
    buttonText() {
      return this.dialogProps.buttonText || 'Remove'
    },
    text() {
      return this.dialogProps.text
    },
    removeAll() {
      return this.dialogProps.removeAll
    },
    title() {
      return this.dialogProps.title
    },
    message() {
      let baseText = this.removeAll ? this.localeText('elementMessage') : this.localeText('instanceMessage')
      let replacementText = ''

      if (this.instanceData?.name || this.elementData?.name) {
        replacementText += this.instanceData?.name || this.elementData?.name
      }

      if (!replacementText) {
        replacementText = this.localeText('thisElement')
      }

      let newSentence = baseText.replace('{{ element }}', replacementText)
      return newSentence
    },
  },
  methods: {
    ...mapActions({
      deleteSceneElement: 'scene/deleteSceneElement',
      showDeleteDialog: 'dialog/showDeleteDialog',
      hideDeleteDialog: 'dialog/hideDeleteDialog',
    }),
    cancel() {
      this.hideDeleteDialog()
    },
    remove() {
      const { element, elementData, instanceData, instance } = this.dialogProps
      const id = instance ? instanceData?.sk : elementData?.sk
      if (instance) {
        const index = elementData.instances.findIndex((i) => i.sk === id)
        Vue.delete(elementData.instances, index)
      }
      this.deleteSceneElement({ element, elementData, instanceData, instance, id })
      this.hideDeleteDialog()
    },
  },
}
</script>
