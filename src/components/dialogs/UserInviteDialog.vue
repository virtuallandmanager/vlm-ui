<template>
  <v-dialog v-model="show" max-width="350" persistent>
    <v-card>
      <v-card-title class="text-h5">Invite User</v-card-title>
      <v-card-text>
        <v-form ref="form">
          <v-text-field
            label="Wallet Address"
            outlined
            v-model="connectedWallet"
            @focus="resetForm"
            :rules="[(v) => !submitted || !!v || `Please enter the user's wallet address`]"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="save"> Send Invite </v-btn>
        <v-btn color="grey darken-1" text @click="closeWindow"> Cancel </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'UserInviteDialog',
  data: () => ({
    connectedWallet: '',
    submitted: false,
  }),
  props: {
    value: Boolean,
  },
  computed: {
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
    ...mapActions({
      inviteUserToCollab: 'scene/inviteUserToCollab',
    }),
    save() {
      this.submitted = true
      if (this.$refs.form.validate()) {
        this.show = false
        this.connectedWallet = ''
        this.submitted = false
        this.inviteUserToCollab(this.connectedWallet)
      } else {
        // The form is invalid, show errors
      }
    },
    closeWindow() {
      this.connectedWallet = ''
      this.submitted = false
      this.show = false
    },
    resetForm() {
      this.submitted = false
      this.$refs.form.resetValidation()
    },
  },
}
</script>
