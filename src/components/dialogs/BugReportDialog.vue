<template>
  <v-dialog v-model="show" max-width="900">
    <v-card>
      <v-card-title class="d-flex justify-center my-0 pb-0"><v-icon>mdi-bug</v-icon></v-card-title>
      <v-card-title class="d-flex justify-center my-0 pt-0">{{ localeText('Bug Report') }}</v-card-title>
      <v-card-text>
        <v-textarea
          v-model="message"
          :label="localeText('actualResult')"
          :hint="localeText('actualResultHint')"
          rows="5"
          auto-grow
          outlined
          dense
        ></v-textarea>
        <v-textarea v-model="reproduction" :label="localeText('reproSteps')" outlined dense :hint="localeText('reproStepsHint')"></v-textarea>
        <v-switch v-model="contactUser" :label="localeText('contactUserLabel')" dense></v-switch>
        <v-text-field v-if="contactUser" v-model="userContactInfo" :label="localeText('contactInfoLabel')" outlined dense></v-text-field>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="accenttext" text @click="submit"> {{ localeAction('Submit') }} </v-btn>
        <v-btn color="grey" text @click="closeWindow"> {{ localeAction('Cancel') }} </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
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
    ...mapGetters({
      localeText: 'i18n/bugReport',
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
