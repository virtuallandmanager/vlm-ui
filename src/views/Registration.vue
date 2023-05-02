<template>
  <v-card elevation="2" class="mx-auto pb-4" max-width="960">
    <gdpr-notice
      :value="showPrivacyPolicy"
      @input="togglePrivacyPolicy"
    ></gdpr-notice>
    <v-card-title>
      <div class="text-h3">Welcome to Virtual Land Manager</div>
    </v-card-title>
    <v-card-text>
      <v-card elevation="12" class="pa-6 my-2">
        <v-card-title class="d-flex justify-space-between">
          User Profile
        </v-card-title>
        <v-card-subtitle>
          Looks like this is your first time connecting this wallet. Let's set
          up your account. (You'll be able to make changes later.)
        </v-card-subtitle>
        <v-card-text>
          <v-text-field
            label="Primary Wallet Address"
            v-model="newUserInfo.connectedWallet"
            disabled
          ></v-text-field>
          <v-text-field
            label="Display Name"
            v-model="newUserInfo.displayName"
            :rules="[validateDisplayName]"
          ></v-text-field>
          <div class="d-flex justify-space-between">
            <v-text-field
              label="Email Address"
              hint="Optional - For future notifications and multi-factor authentication"
              persistent-hint
              validate-on-blur
              :rules="[validateEmailAddress]"
              v-model="newUserInfo.emailAddress"
              class="mr-2"
            ></v-text-field>
            <vue-tel-input-vuetify
              class="ml-2 flex-grow-1"
              :preferred-countries="['us', 'ca', 'ar', 'gb', 'fr', 'de']"
              v-model="phone"
              label="Mobile Phone"
              hint="Optional - For future notifications and multi-factor authentication"
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
        <v-card-title> User Roles </v-card-title>
        <v-card-subtitle>
          Select additional features you'd like to use.
        </v-card-subtitle>
        <v-card-text>
          <div class="d-flex">
            <v-switch
              label="Advanced User"
              hint="Enables use of advanced developer features and custom SDK implementation"
              persistent-hint
              v-model="newUserRoles[1]"
            ></v-switch>
          </div>
          <div class="d-flex">
            <v-switch
              label="Organization Admin"
              hint="Enables team administration features"
              persistent-hint
              v-model="newUserRoles[3]"
            ></v-switch>
          </div>
        </v-card-text>
      </v-card>
      <v-card elevation="12" class="pa-6" v-if="newUserRoles[3]">
        <v-card-title> Create Organization </v-card-title>
        <v-card-subtitle>
          Set a name for your organization - you'll be able to make more changes
          later.
        </v-card-subtitle>
        <v-card-text>
          <v-text-field
            label="Organization Display Name"
            v-model="newOrg.displayName"
            class="mr-2"
            :rules="[validateOrgDisplayName]"
          ></v-text-field>
        </v-card-text>
      </v-card>
    </v-card-text>
    <v-card-actions class="d-flex px-4">
      <div class="flex-grow-1 justify-space-around">
        <v-btn @click="showPrivacyPolicy = true">Privacy Policy</v-btn>
      </div>
      <div class="flex-shrink-0 justify-space-around">
        <v-btn @click="saveAndContinue" color="primary"
          >Save And Continue</v-btn
        >
      </div>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapActions, mapState } from "vuex";
import GdprNotice from "../components/dialogs/GDPRNotice";

export default {
  components: { GdprNotice },
  name: "Registration",
  data: () => ({
    newUserInfo: {},
    newOrg: { displayName: "AnonCo" },
    newOrgMembers: [],
    newUserRoles: [true, false, false, false],
    phone: null,
    showPrivacyPolicy: false,
  }),
  mounted() {
    this.newUserInfo = { ...this.userInfo } || {};
    this.newOrgMembers.push(this.newUserInfo.connectedWallet);
  },
  computed: {
    ...mapState("user", ["userInfo"]),
    orgAdmin() {
      return this.newUserRoles[3];
    },
  },
  methods: {
    ...mapActions("user", ["setupUserInfo"]),
    saveAndContinue() {
      if (this.newUserRoles[3] && !this.newOrg.displayName) {
        return;
      }
      if (this.newUserInfo?.phone?.number && !this.newUserInfo?.phone?.valid) {
        return;
      }
      const smsCountryData = {
        name: this.newUserInfo?.phone?.country?.name,
        code: this.newUserInfo?.phone?.country?.iso2,
      };
      this.newUserInfo.smsPhoneNumber = {
        ...this.newUserInfo.phone,
        country: smsCountryData,
      };
      this.newUserInfo.roles = this.newUserRoles
        .map((role, i) => (role ? i : null))
        .filter((x) => x !== null);

      this.setupUserInfo({
        userInfo: this.newUserInfo,
        userOrgInfo: this.orgAdmin ? this.newOrg : null,
      });
    },
    validateDisplayName() {
      if (!this.newUserInfo?.displayName) {
        return "Wait, what should we call you? You can use a pseudonym if you want.";
      } else {
        return true;
      }
    },
    validateOrgDisplayName() {
      if (!this.newUserInfo?.displayName) {
        return "Meh, technically we don't REALLY need this, but it'll make it easier to know who's who.";
      } else {
        return true;
      }
    },
    validatePhoneNumber() {
      if (!this.newUserInfo?.smsPhoneNumber) {
        return true;
      } else if (
        this.newUserInfo?.smsPhoneNumber?.number &&
        this.newUserInfo?.smsPhoneNumber?.valid
      ) {
        return true;
      } else {
        return "Please enter a valid phone number or leave this field blank";
      }
    },
    validateEmailAddress() {
      if (
        this.newUserInfo.emailAddress &&
        !this.newUserInfo.emailAddress.includes("@")
      ) {
        return "Please enter a valid email address or leave this field blank.";
      } else {
        return true;
      }
    },
    onInput(formattedNumber, { number, valid, country }) {
      this.userInfo.smsPhoneNumber = {
        formattedNumber,
        number,
        valid,
        country,
      };
    },
    togglePrivacyPolicy() {
      this.showPrivacyPolicy = !this.showPrivacyPolicy;
    },
    handleDialog(dialogOptions) {
      this.$emit("handleDialog", { show: true, ...dialogOptions });
    },
  },
};
</script>
