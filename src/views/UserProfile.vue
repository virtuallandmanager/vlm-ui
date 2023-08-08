<template>
  <div>
    <v-card elevation="2" class="mx-auto pb-4" max-width="960">
      <v-card-title>
        <div class="text-h3">User Profile</div>
      </v-card-title>
      <v-card-text>
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
      <v-card-title>Advanced & Experimental</v-card-title>
      <v-card-subtitle>
        Enable additional user roles and experimental features.
      </v-card-subtitle>
      <v-card-text>
        <div class="d-flex">
          <v-switch
            label="Advanced User"
            hint="Enables use of advanced developer features and custom SDK implementation"
            persistent-hint
            v-model="newUserRoles[2]"
          ></v-switch>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import GdprNotice from "../components/dialogs/GDPRNotice";

export default {
  components: { GdprNotice },
  name: "Registration",
  data: () => ({
    newUserInfo: { roles: [0, 1] },
    newOrg: { displayName: "AnonCo" },
    newUserRoles: [true, true, false, false, false],
    phone: null,
    showPrivacyPolicy: false,
  }),
  mounted() {
    this.newUserInfo = { roles: this.newUserRoles, ...this.userInfo } || {};
  },
  computed: {
    ...mapGetters("user", ["userInfo"]),
    orgAdmin() {
      return this.newUserRoles[4];
    },
    saving() {
      return this.$store.state.user.processing;
    },
  },
  methods: {
    async saveAndContinue() {
      try {
        if (this.orgAdmin && !this.newOrg.displayName) {
          this.showError({
            message: "Please enter a name for your organization.",
            timeout: 4000,
          });
          return;
        }
        if (
          this.newUserInfo?.phone?.number &&
          !this.newUserInfo?.phone?.valid
        ) {
          this.showError({ message: "Invalid phone number.", timeout: 4000 });
          return;
        }

        this.newUserInfo.roles = this.newUserRoles
          .map((role, i) => (role ? i : -1))
          .filter((x) => x > -1);

        await this.setupUserInfo({
          newUserInfo: this.newUserInfo,
          userOrgInfo: this.orgAdmin ? this.newOrg : null,
        });
      } catch (error) {
        console.log(error);
        this.showError({ message: error, timeout: 4000 });
      }
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
      const smsCountryData = {
        name: country?.name,
        code: country?.iso2,
      };
      this.newUserInfo.smsPhoneNumber = {
        formattedNumber,
        number,
        valid,
        country: smsCountryData,
      };
    },
    togglePrivacyPolicy() {
      this.showPrivacyPolicy = !this.showPrivacyPolicy;
    },
    handleDialog(dialogOptions) {
      this.$emit("handleDialog", { show: true, ...dialogOptions });
    },
    ...mapActions({
      setupUserInfo: "user/setupUserInfo",
      showError: "banner/showError",
    }),
  },
};
</script>
