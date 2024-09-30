<template>
  <v-card elevation="2" class="mx-auto pb-4" max-width="960">
    <gdpr-notice :value="showPrivacyPolicy" @input="togglePrivacyPolicy"></gdpr-notice>
    <v-card-title>
      <div class="text-h3">{{ localeText('Welcome') }}</div>
    </v-card-title>
    <v-card-text>
      <v-card elevation="12" class="pa-6 my-2">
        <v-card-title class="d-flex justify-space-between"> {{ localeText('User Profile') }} </v-card-title>
        <v-card-subtitle>
          {{ localeText('RegistrationTagline') }}
        </v-card-subtitle>
        <v-card-text>
          <v-text-field :label="localeText('Primary Wallet Address')" v-model="newUserInfo.connectedWallet" disabled></v-text-field>
          <v-text-field :label="localeText('Display Name')" v-model="newUserInfo.displayName" :rules="[validateDisplayName]"></v-text-field>
          <div class="d-flex justify-space-between">
            <v-text-field
              :label="localeText('Email Address')"
              :hint="localeText('OptionalHint')"
              persistent-hint
              validate-on-blur
              :rules="[validateEmailAddress]"
              v-model="newUserInfo.emailAddress"
              class="mr-2"
            ></v-text-field>
            <vue-tel-input-vuetify
              class="ml-2 flex-grow-1"
              :preferred-countries="['us', 'ca', 'ar', 'gb', 'fr', 'de', 'cn', 'jp']"
              v-model="phone"
              :label="localeText('Mobile Phone Number')"
              :hint="localeText('OptionalHint')"
              :rules="[validatePhoneNumber]"
              disabledFetchingCountry
              persistent-hint
              :defaultCountry="newUserInfo.location?.country_code || 'us'"
              @input="onInput"
            />
          </div>
        </v-card-text>
      </v-card>

      <v-card elevation="12" class="pa-6 my-2">
        <v-card-title> {{ localeText('User Roles') }} </v-card-title>
        <v-card-subtitle> {{ localeText("Select additional features you'd like to use.") }} </v-card-subtitle>
        <v-card-text>
          <div class="d-flex">
            <v-switch label="Advanced User" :hint="localeText('AdvancedUserDescription')" persistent-hint v-model="newUserRoles[2]"></v-switch>
          </div>
          <div class="d-flex">
            <v-switch
              :label="localeText('Organization Admin')"
              :hint="localeText('OrganizationAdminDescription')"
              persistent-hint
              v-model="newUserRoles[4]"
            ></v-switch>
          </div>
        </v-card-text>
      </v-card>
      <v-card elevation="12" class="pa-6" v-if="orgAdmin">
        <v-card-title> {{ localeText('Create Organization') }} </v-card-title>
        <v-card-subtitle> {{ localeText("Set a name for your organization - you'll be able to make more changes later.") }} </v-card-subtitle>
        <v-card-text>
          <v-text-field
            :label="localeText('Organization Display Name')"
            v-model="newOrg.displayName"
            class="mr-2"
            :rules="[validateOrgDisplayName]"
          ></v-text-field>
        </v-card-text>
      </v-card>
    </v-card-text>
    <v-card-actions class="d-flex px-4">
      <div class="flex-grow-1 justify-space-around">
        <v-btn @click="showPrivacyPolicy = true">{{ localeAction('Privacy Policy') }}</v-btn>
      </div>
      <div class="flex-shrink-0 justify-space-around">
        <v-btn @click="saveAndContinue" :loading="saving" :disabled="saving" color="primary">{{ localeAction('Save And Continue') }}</v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import GdprNotice from '../components/dialogs/GDPRNotice'

export default {
  components: { GdprNotice },
  name: 'Registration',
  data: () => ({
    newUserInfo: { roles: [0, 1] },
    newOrg: { displayName: 'AnonCo' },
    newUserRoles: [true, true, false, false, false],
    phone: null,
    showPrivacyPolicy: false,
  }),
  mounted() {
    this.newUserInfo = { roles: this.newUserRoles, ...this.userInfo } || {}
  },
  computed: {
    ...mapGetters({
      userInfo: 'user/userInfo',
      localeText: 'i18n/registration',
      localeNav: 'i18n/navigation',
      localeAction: 'i18n/actions',
    }),
    orgAdmin() {
      return this.newUserRoles[4]
    },
    saving() {
      return this.$store.state.user.processing
    },
  },
  methods: {
    async saveAndContinue() {
      try {
        if (this.orgAdmin && !this.newOrg.displayName) {
          this.showError({
            message: this.localeText('MissingOrgError'),
            timeout: 4000,
          })
          return
        }
        if (this.newUserInfo?.phone?.number && !this.newUserInfo?.phone?.valid) {
          this.showError({ message: this.localeText('InvalidPhoneNumberError'), timeout: 4000 })
          return
        }

        this.newUserInfo.roles = this.newUserRoles.map((role, i) => (role ? i : -1)).filter((x) => x > -1)

        await this.setupUserInfo({
          newUserInfo: this.newUserInfo,
          userOrgInfo: this.orgAdmin ? this.newOrg : null,
        })
        this.$router.push('/scenes')
      } catch (error) {
        console.log(error)
        this.showError({ message: error, timeout: 4000 })
      }
    },
    validateDisplayName() {
      if (!this.newUserInfo?.displayName) {
        return this.localeText('DisplayNameValidation')
      } else {
        return true
      }
    },
    validateOrgDisplayName() {
      if (!this.newUserInfo?.displayName) {
        return this.localeText('OrgDisplayNameValidation')
      } else {
        return true
      }
    },
    validatePhoneNumber() {
      if (!this.newUserInfo?.smsPhoneNumber) {
        return true
      } else if (this.newUserInfo?.smsPhoneNumber?.number && this.newUserInfo?.smsPhoneNumber?.valid) {
        return true
      } else {
        return this.localeText('PhoneNumberValidation')
      }
    },
    validateEmailAddress() {
      if (this.newUserInfo.emailAddress && !this.newUserInfo.emailAddress.includes('@')) {
        return this.localeText('EmailAddressValidation')
      } else {
        return true
      }
    },
    onInput(formattedNumber, { number, valid, country }) {
      const smsCountryData = {
        name: country?.name,
        code: country?.iso2,
      }
      this.newUserInfo.smsPhoneNumber = {
        formattedNumber,
        number,
        valid,
        country: smsCountryData,
      }
    },
    togglePrivacyPolicy() {
      this.showPrivacyPolicy = !this.showPrivacyPolicy
    },
    ...mapActions({
      setupUserInfo: 'user/setupUserInfo',
      showError: 'banner/showError',
    }),
  },
}
</script>
