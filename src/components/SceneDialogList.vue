<template>
  <div>
    <div class="d-flex pa-6 mx-auto align-baseline justify-space-between">
      <h1 class="text-h5 ml-2">Dialogs</h1>
    </div>
    <div v-for="(dialog, d) in dialogs" :key="d">
      <div class="grey darken-3 dark pa-6">
        <h1 class="text-h6 white--text">
          {{ dialogType(dialog.dialogType) }}
        </h1>
      </div>

      <v-switch
        v-model="dialog.enabled"
        label="Enable Dialog"
        class="ma-4"
        hide-details="true"
        @change="toggleDialog(d)"
        dense
      >
      </v-switch>

      <div v-for="(message, m) in dialog.messages" :key="m" class="px-4">
        <v-textarea
          clearable
          :value="dialog.messages[m]"
          auto-grow
          rows="1"
          :label="`Message ${m + 1}`"
          @blur="editMessageText"
        >
          <template v-slot:append-outer>
            <v-dialog
              v-model="deleteMessageDialog"
              persistent
              max-width="395"
              @click:outside="deleteMessageDialog = false"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon v-bind="attrs" v-on="on">
                        mdi-trash-can
                      </v-icon>
                    </template>
                    <span>Remove Message</span>
                  </v-tooltip>
                </v-btn>
              </template>
              <v-card>
                <v-card-title class="text-h5">
                  Remove Message From Dialog?
                </v-card-title>
                <v-card-text>Are you sure?</v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="red darken-1" text @click="removeMessage(d, m)">
                    Remove
                  </v-btn>
                  <v-btn
                    color="grey darken-1"
                    text
                    @click="deleteMessageDialog = false"
                  >
                    Cancel
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </template>
        </v-textarea>
      </div>
      <div class="d-flex justify-end px-4">
        <v-btn @click="addMessage(d)"
          ><v-icon>mdi-plus</v-icon> Add Message</v-btn
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DialogSystem',

  data: () => ({
    deleteMessageDialog: false
  }),
  props: {
    dialogs: {
      type: Array,
      default: function () {
        return [{ dialogType: 0, messages: [''], enabled: false }]
      }
    }
  },
  methods: {
    addMessage (d) {
      console.log(this.dialogs)
      const nextItem = ''
      this.dialogs[d].messages.push(nextItem)
    },
    removeMessage (d, m) {
      this.deleteMessageDialog = false
      this.dialogs[d].messages.splice(m, 1)
      this.updateProperties({
        action: 'update',
        entity: 'dialog',
        property: 'message'
      })
    },
    editMessageText (d) {
      console.log(this.dialogs[d].enabled)
      this.updateProperties({
        action: 'update',
        entity: 'dialog',
        property: 'message'
      })
    },
    toggleDialog (d) {
      console.log(this.dialogs[d].enabled)
      this.updateProperties({
        action: 'update',
        entity: 'dialog',
        property: 'visibility'
      })
    },
    dialogType (dialogType) {
      switch (dialogType) {
        case 0:
          return 'Welcome Message'
      }
    },
    updateProperties (wssMessages) {
      this.$emit('updateProperties', { ...wssMessages })
    }
  }
}
</script>
