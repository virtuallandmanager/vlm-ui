<template>
  <v-card>
    <v-container class="py-6 mx-auto">
      <v-row>
        <v-col no-gutters>
          <h1 class="text-h5 ml-2">Dialogs</h1>
        </v-col>
      </v-row>
      <div v-for="(dialog, d) in dialogs" :key="d" class="my-6">
        <v-row class="grey darken-3 mx-n3">
          <v-col no-gutters>
            <h1 class="text-h6 white--text">
              {{ dialogType(dialog.dialogType) }}
            </h1>
          </v-col>
        </v-row>
        <v-row>
          <v-col align="left">
            <v-switch
              v-model="dialog.enabled"
              label="Enable Dialog"
              class="my-0"
              hide-details="true"
              @change="toggleDialog(d)"
              dense
            >
            </v-switch>
          </v-col>
        </v-row>
        <v-row>
          <v-col v-for="(message, m) in dialog.messages" :key="m" cols="12">
            <v-textarea
              clearable
              :value="dialog.messages[m]"
              auto-grow
              rows="1"
              :label="`Message ${m + 1}`"
              @blur="updateProperties()"
            >
              <template v-slot:append-outer>
                <v-dialog
                  v-model="deleteMessageDialog"
                  persistent
                  max-width="385"
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
                    <v-card-text
                      >Are you sure you want to remove this
                      message?</v-card-text
                    >
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        color="red darken-1"
                        text
                        @click="removeMessage(m)"
                      >
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
          </v-col>
          <v-col>
            <v-btn @click="addMessage(d)">Add Message</v-btn>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </v-card>
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
      console.log(this.dialogs)
      this.dialogs[d].messages.splice(m, 1)
      this.updateProperties()
    },
    toggleDialog (d) {
      console.log(this.dialogs[d].enabled)
      this.updateProperties()
    },
    dialogType (dialogType) {
      switch (dialogType) {
        case 0:
          return 'Welcome Message'
      }
    },
    updateProperties () {
      this.$emit('updateProperties')
    }
  }
}
</script>
