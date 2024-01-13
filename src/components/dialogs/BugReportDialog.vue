<template>
  <v-dialog v-model="show" max-width="900">
    <v-card>
      <v-card-title class="d-flex justify-center my-0 pb-0"><v-icon>mdi-bug</v-icon></v-card-title>
      <v-card-title class="d-flex justify-center my-0 pt-0">Bug Report</v-card-title>
      <v-card-text>
        <v-textarea
          v-model="message"
          label="What happened?"
          hint="Please describe what happened, along with what you thought would happen, or what you expected to happen."
          rows="5"
          auto-grow
          outlined
          dense
        ></v-textarea>
        <v-textarea
          v-model="reproduction"
          label="What were you doing when you found the bug?"
          outlined
          dense
          hint="Your most recent steps are the most helpful."
        ></v-textarea>
        <v-switch v-model="contactUser" label="Would you like VLM Support to contact you for help with this?" dense></v-switch>
        <v-text-field
          v-if="contactUser"
          v-model="userContactInfo"
          label="If so, please provide your preferred contact info."
          outlined
          dense
        ></v-text-field>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="accenttext" text @click="submit"> Submit </v-btn>
        <v-btn color="grey" text @click="closeWindow"> Cancel </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  name: 'BugReportDialog',
  data: () => ({
    message: '',
    reproduction: '',
    contactUser: false,
    userContactInfo: '',
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
    currentUrl() {
      return window.location.href
    },
  },
  methods: {
    ...mapActions({ submitBugReport: 'logs/submitBugReport' }),
    submit() {
      this.submitBugReport({
        message: this.message,
        reproduction: this.reproduction,
        userContactInfo: { contactUser: this.contactUser, contactInfo: this.userContactInfo },
        url: this.currentUrl,
      })
      this.closeWindow()
    },
    closeWindow() {
      this.show = false
    },
  },
}
</script>
