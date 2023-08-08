<template>
  <content-page centerContent>
    <gdpr-notice :value="showPrivacyPolicy" @input="togglePrivacyPolicy"></gdpr-notice>
    <template v-slot:header>
      Welcome to Virtual Land Manager!
    </template>
    <v-card-subtitle class="text-h5 text-center">
      What would you like to do with this wallet?
    </v-card-subtitle>
    <v-card-text class="d-flex">
      <v-container><v-row>
          <v-col>
            <v-card elevation="12" class="d-flex flex-column justify-space-between pa-6 my-2" to="/privacy" min-height="250">
              <v-card-title class="d-block text-center">
                Adjust Privacy Settings
              </v-card-title>
              <div><v-icon large>mdi-lock</v-icon></div>
              <v-card-text class="text-left">
                <ul>
                  <li>Learn about VLM's commitment to protecting user data and privacy</li>
                  <li>Decide what information VLM can store about you</li>
                  <li>Redact your stored information</li>
                  <li>Opt out of VLM's analytics service entirely</li>
                </ul>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col>
            <v-card elevation="12" class="d-flex flex-column justify-space-between pa-6 my-2" to="/join" min-height="250">
              <v-card-title class="d-block text-center">
                Register For An Account
              </v-card-title>
              <div><v-icon large>mdi-user-account</v-icon></div>
              <v-card-text class="text-left">
                <ul>
                  <li>
                    Create a free account with Virtual Land Manager
                  </li>
                  <li>
                    Create an organization to share access with your team
                  </li>
                  <li>
                    Start connecting your metaverse scenes
                  </li>
                </ul>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row></v-container>
    </v-card-text>
  </content-page>
</template>

<script>
import { mapActions } from "vuex";
import ContentPage from "../components/ContentPage"
import GdprNotice from "../components/dialogs/GDPRNotice";

export default {
  name: "Triage",
  components: { GdprNotice, ContentPage },
  data: () => ({
    showPrivacyPolicy: false
  }),
  mounted() {
    this.setNavState(false);
  },
  methods: {
    ...mapActions({ setNavState: "app/setNavState" }),
    togglePrivacyPolicy() {
      this.showPrivacyPolicy = !this.showPrivacyPolicy;
    },
  }
};
</script>
