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
          v-model="dialog.messages[m]"
          auto-grow
          rows="1"
          :label="`Message ${m + 1}`"
          @blur="editMessageText(d)"
        >
          <template v-slot:append-outer>
            <v-dialog
              v-model="deleteMessageDialog"
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
import Vue from 'vue'
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
      const nextItem = ''
      this.dialogs[d].messages.push(nextItem),
      this.updateProperties({
        action: 'add',
        entity: 'dialog',
        property: 'message',
        entityData: this.dialogs[d]
      })
    },
    removeMessage (d, m) {
      this.deleteMessageDialog = false
      this.dialogs[d].messages.splice(m, 1)
      this.updateProperties({
        action: 'update',
        entity: 'dialog',
        property: 'message',
        entityData: this.dialogs[d]
      })
    },
    editMessageText (d) {
      console.log(this.dialogs[d].messages)
      Vue.set(this.dialogs[d], 'messages', this.dialogs[d].messages)
      this.updateProperties({
        action: 'update',
        entity: 'dialog',
        property: 'message',
        entityData: this.dialogs[d]
      })
    },
    toggleDialog (d) {
      this.updateProperties({
        action: 'update',
        entity: 'dialog',
        property: 'visibility',
        entityData: this.dialogs[d]
      })
    },
    dialogType (dialogType) {
      switch (dialogType) {
        case 0:
          return 'Welcome Message'
      }
    },
    updateProperties (wssMessages) {
      this.$emit('updateProperties', { wssMessages })
    }
  }
}
</script>
