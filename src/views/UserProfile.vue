<template>
  <content-page :loadingMessage="localeText('LoadingMessage')" :noContent="!userInfo">
    <v-card elevation="2" class="mx-auto pb-4" max-width="960">
      <v-card-title> {{ localeText('User Profile') }} </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" md="4" class="text-center">
              <div class="text-h6">{{ userInfo.displayName }}</div>
              <div class="text-display">{{ localeText('Member Since') }} {{ formattedRegisterDate }}</div>
              <v-avatar size="128px" class="ma-4" @click="onAvatarClick">
                <img :src="userAvatar" :alt="localeText('Avatar')" />
              </v-avatar>
              <v-btn @click="onAvatarClick" class="mt-2">{{ localeText('Change Avatar') }}</v-btn>
              <input type="file" ref="fileInput" accept="image/*" style="display: none" @change="onFileSelected" />
              <div class="text-h6 mt-4" v-if="specialUserRoles?.length">{{ localeText('Badges') }}</div>
              <div v-if="specialUserRoles?.length">
                <Badge icon="mdi-weather-sunset" :title="localeText('Early Access')" :description="localeText('earlyAccessDescription')" />
              </div>
              <div v-if="allAdminRoles.length" class="d-flex flex-column align-center">
                <div class="text-h6 mt-4">{{ localeText('Admin Roles') }}</div>
                <v-chip-group v-for="role in allAdminRoles" :key="role" class="d-flex flex-space-around">
                  <v-chip>{{ role }}</v-chip>
                </v-chip-group>
              </div>
            </v-col>
            <v-col>
              <div class="d-flex flex-column justify-space-between">
                <v-text-field :label="localeText('Primary Wallet Address')" v-model="userInfo.connectedWallet" disabled></v-text-field>
                <v-text-field
                  :label="localeText('Email Address')"
                  :hint="localeText('OptionalHint')"
                  persistent-hint
                  validate-on-blur
                  :rules="[validateEmailAddress]"
                  v-model="userInfo.emailAddress"
                  class="mr-2"
                  @change="saveAndContinue"
                ></v-text-field>
                <vue-tel-input-vuetify
                  class="ml-2 flex-grow-1"
                  :preferred-countries="['us', 'ca', 'ar', 'gb', 'fr', 'de']"
                  v-model="phone"
                  :label="localeText('Mobile Phone')"
                  :hint="localeText('OptionalHint')"
                  :rules="[validatePhoneNumber]"
                  disabledFetchingCountry
                  persistent-hint
                  :defaultCountry="userInfo.location?.country_code || 'us'"
                  @input="onInput"
                  @change="saveAndContinue"
                />
              </div>
              <div class="text-h6 mt-4">{{ localeText('Preferred Language') }}</div>
              <div class="text-h6 mt-4">
                <locale-selector :showName="true" location="bottom" />
              </div>
              <div class="text-h6 mt-4">{{ localeText('Advanced & Experimental Features') }}</div>
              <v-card-subtitle class="pa-0"> {{ localeText('AdvancedFeaturesDescription') }} </v-card-subtitle>
              <v-switch
                :label="localeText('Advanced User')"
                :hint="localeText('AdvancedUserDescription')"
                persistent-hint
                v-model="userRoles[2]"
                @change="enableAdvancedUserRole"
                class="mt-0"
              ></v-switch>
              <div class="text-h6 mt-4">{{ localeText('Team Collaboration Features') }}</div>
              <v-switch
                :label="localeText('Organization Admin')"
                :hint="localeText('OrganizationAdminDescription')"
                persistent-hint
                v-model="userRoles[4]"
                @change="enableOrgAdminRole"
                class="mt-0"
              ></v-switch>
              <div class="text-h6 mt-2">{{ localeText('Demo Features') }}</div>
              <v-switch
                :label="localeText('Hide Demo Scene')"
                v-model="userInfo.hideDemoScene"
                @change="saveAndContinue"
                persistent-hint
                :hint="localeText('HideDemoSceneHint')"
                class="mt-0"
              ></v-switch>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </content-page>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ContentPage from '../components/ContentPage'
import { DateTime } from 'luxon'
import Badge from '../components/Badge'
import LocaleSelector from '../components/LocaleSelector'

export default {
  components: { ContentPage, Badge, LocaleSelector },
  name: 'UserProfile',
  data: () => ({
    userInfo: {},
    userRoles: Array(11).fill(false),
    phone: null,
    showPrivacyPolicy: false,
  }),
  mounted() {
    this.userInfo = this.user || {}
    this.user?.roles.forEach((role) => {
      this.userRoles[role] = true
    })
    this.phone = this.userInfo?.smsPhoneNumber?.formattedNumber || ''
  },
  computed: {
    ...mapGetters({
      user: 'user/userInfo',
      isAdvancedUser: 'user/isAdvancedUser',
      localeText: 'i18n/userProfile',
    }),
    specialUserRoles() {
      if (!this.userInfo.roles) return []

      let filteredRoles = this.userInfo.roles.filter((role) => role == 1)

      return filteredRoles.map((role) => this.getUserRole(role))
    },
    highestAdminRole() {
      const maxRole = Math.max(...this.userInfo.roles)
      if (maxRole > 2 && this.userRoles.includes(maxRole)) {
        return this.getUserRole(maxRole)
      } else {
        return null
      }
    },
    allAdminRoles() {
      if (!this.userInfo.roles) return []

      let filteredRoles = this.userInfo.roles.filter((role) => role > 3)

      return filteredRoles.map((role) => this.getUserRole(role))
    },
    formattedRegisterDate() {
      if (!this.userInfo.registeredAt) return ''
      return new DateTime.fromSeconds(this.userInfo.registeredAt).toLocaleString()
    },
    orgAdmin() {
      return this.userRoles[4]
    },
    saving() {
      return this.$store.state.user.processing
    },
    userAvatar() {
      if (
        this.userInfo.avatar !== 'https://vlm.gg/media/avatar/default.png' &&
        this.userInfo.avatar !== 'https://api.vlm.gg/media/avatar/default.png'
      ) {
        return this.userInfo.avatar
      } else {
        return `https://api.vlm.gg/media/avatar/default.png`
      }
    },
  },
  methods: {
    async saveAndContinue() {
      try {
        if (this.userInfo?.phone?.number && !this.userInfo?.phone?.valid) {
          this.showError({ message: this.localeText('InvalidPhoneNumberError'), timeout: 4000 })
          return
        }

        if (this.newUserRoles?.length) {
          this.userInfo.roles = this.newUserRoles
        }

        await this.updateUserInfo({
          userInfo: this.userInfo,
        })
      } catch (error) {
        console.log(error)
        this.showError({ message: error, timeout: 4000 })
      }
    },
    enableAdvancedUserRole() {
      if (this.userRoles[2] && !this.userInfo.roles.includes(2)) {
        this.newUserRoles = this.userInfo.roles.concat(2).sort()
      } else if (!this.userRoles[2]) {
        this.newUserRoles = this.userInfo.roles.filter((role) => role !== 2)
      }
      this.$nextTick(() => {
        this.saveAndContinue()
      })
    },
    enableOrgAdminRole() {
      if (this.userRoles[4] && !this.userInfo.roles.includes(4)) {
        this.newUserRoles = this.userInfo.roles.concat(4).sort()
      } else if (!this.userRoles[4]) {
        this.newUserRoles = this.userInfo.roles.filter((role) => role !== 4)
      }
      this.$nextTick(() => {
        this.saveAndContinue()
      })
    },
    validateDisplayName() {
      if (!this.userInfo?.displayName) {
        return 'Wait, what should we call you? You can use a pseudonym if you want.'
      } else {
        return true
      }
    },
    onFileSelected() {
      // const file = event.target.files[0];
      // Implement the logic to upload the file and update the user's avatar URL
      // You might need a backend service to handle file uploads
      // After the file is uploaded, update the account.avatar with the new URL
    },

    validateOrgDisplayName() {
      if (!this.userInfo?.displayName) {
        return this.localeText('OrgDisplayNameValidation')
      } else {
        return true
      }
    },
    validatePhoneNumber() {
      if (!this.userInfo?.smsPhoneNumber) {
        return true
      } else if (this.userInfo?.smsPhoneNumber?.number && this.userInfo?.smsPhoneNumber?.valid) {
        return true
      } else {
        return this.localeText('InvalidPhoneNumberError')
      }
    },
    validateEmailAddress() {
      if (this.userInfo.emailAddress && !this.userInfo.emailAddress.includes('@')) {
        return this.localeText('InvalidEmailError')
      } else {
        return true
      }
    },
    onAvatarClick() {
      this.$refs.fileInput.click()
    },
    onInput(formattedNumber, { number, valid, country }) {
      const smsCountryData = {
        name: country?.name,
        code: country?.iso2,
      }
      this.userInfo.smsPhoneNumber = {
        formattedNumber,
        number,
        valid,
        country: smsCountryData,
      }
    },
    getUserRole(role) {
      switch (role) {
        case 0:
          return this.localeText('Basic User')
        case 1:
          return this.localeText('Early Access')
        case 2:
          return this.localeText('Advanced User')
        case 3:
          return this.localeText('Land Admin')
        case 4:
          return this.localeText('Organization Admin')
        case 5:
          return this.localeText('VLM Contractor')
        case 6:
          return this.localeText('VLM Employee')
        case 7:
          return this.localeText('VLM Admin')
        case 8:
          return this.localeText('Placeholder Role')
        case 9:
          return this.localeText('Placeholder Role')
        case 10:
          return this.localeText('God Mode')
        default:
          return this.localeText('Unknown')
      }
    },
    togglePrivacyPolicy() {
      this.showPrivacyPolicy = !this.showPrivacyPolicy
    },
    handleDialog(dialogOptions) {
      this.$emit('handleDialog', { show: true, ...dialogOptions })
    },
    ...mapActions({
      updateUserInfo: 'user/updateUserInfo',
      showError: 'banner/showError',
    }),
  },
}
</script>
