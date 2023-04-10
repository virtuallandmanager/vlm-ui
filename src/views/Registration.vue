<template>
  <v-card elevation="2" class="mx-auto pb-4" max-width="960">
    <gdpr-notice :value="showPrivacyPolicy" @input="togglePrivacyPolicy"></gdpr-notice>
    <v-card-title class="text-center">
      <div class="mx-auto text-h3">Welcome to Virtual Land Manager!</div>
    </v-card-title>
    <v-card-text>
      <div class="text-display text-center">
        It looks like this is your first time connecting this wallet. Would you
        like to set up your user profile?
      </div>
      <div class="text-display text-center">
        All info is optional and can be changed later. Feel free to use a
        pseudonym.
      </div>
      <div class="text-display text-center">
        Mobile Phone and Email Address will be used in the future for opt-in
        only notifications and multi-factor authentication.
      </div>
      <div class="text-display text-center">GDPR Privacy Notice</div>
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
          hint="Optional"
          persistent-hint
          v-model="newUserInfo.emailAddress"
          class="mr-2"
        ></v-text-field>
        <vue-tel-input-vuetify
          class="ml-2 flex-grow-1"
          :preferred-countries="['us', 'ca', 'ar', 'gb', 'fr', 'de']"
          v-model="phone"
          label="Mobile Phone"
          hint="Optional"
          :rules="[validatePhoneNumber]"
          disabledFetchingCountry
          persistent-hint
          :defaultCountry="newUserInfo.location?.country_code || 'us'"
          @input="onInput"
        />
      </div>
    </v-card-text>
    <v-card-actions class="d-flex px-4">
      <div class="flex-grow-1 justify-space-around">
        <v-btn @click="showPrivacyPolicy = true">Privacy Policy</v-btn>
      </div>
      <div class="flex-shrink-0 justify-space-around">
        <v-btn @click="saveAndContinue" color="primary"
          >Save User Profile</v-btn
        >
      </div>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import GdprNotice from "../components/dialogs/GdprNotice";

export default {
  components: { GdprNotice },
  name: "Registration",
  data: () => ({
    newUserInfo: {},
    phone: null,
    showPrivacyPolicy: false,
  }),
  mounted() {
    this.newUserInfo = { ...this.userInfo } || {};
  },
  computed: {
    ...mapGetters("auth", ["userInfo"]),
  },
  methods: {
    ...mapActions("user", ["updateUserInfo"]),
    saveAndContinue() {
      if (this.newUserInfo?.phone?.number && !this.newUserInfo?.phone?.valid) {
        return;
      }
      this.updateUserInfo(this.newUserInfo);
    },
    validateDisplayName() {
      if (!this.newUserInfo?.displayName) {
        return "Wait, what should we call you?";
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
    validateEmailAddress() {},
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
