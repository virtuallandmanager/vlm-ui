<template>
  <v-app>
    <v-app-bar app :color="environment" dark>
      <router-link to="/" class="header-link">
        <img src="@/assets/VLM-Logo-Color.svg" height="65" />
      </router-link>
      <div v-if="environment !== 'production'" class="text-body1 ml-4">
        {{ environment.toUpperCase() }}
      </div>
      <v-spacer></v-spacer>
      <template>
        <v-tabs align-with-title color="nav" v-if="connected">
          <!-- <v-tab v-if="!connected">About</v-tab> -->
          <!-- <v-tab v-if="!connected">Pricing</v-tab> -->
          <v-tab>Scenes</v-tab>
          <v-tab>Events</v-tab>
          <v-tab>Docs</v-tab>
          <!-- <v-tab>Wiki</v-tab> -->
        </v-tabs>
      </template>
      <v-spacer></v-spacer>
      <v-btn
        icon
        class="mr-2"
        href="https://discord.gg/hYzxFZmbvf"
        target="_blank"
      >
        <img src="@/assets/discord-logo.svg" height="30" />
      </v-btn>
      <v-btn
        v-if="!connected"
        rounded
        color="primary"
        @click.stop="connectButton()"
        :loading="loggingIn"
      >
        <v-icon class="mr-2">mdi-wallet</v-icon>
        Connect Wallet
      </v-btn>
      <v-menu offset-y bottom nudge-bottom="15px">
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" text v-if="connected && !signing">
            <v-icon class="mr-2">mdi-wallet</v-icon>
            <span>{{ walletAddress }}</span>
          </v-btn>
        </template>
        <v-list>
          <v-list-item link>
            <v-list-item-title>User Profile</v-list-item-title>
          </v-list-item>
          <v-list-item link>
            <v-list-item-title>Log Out</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-main>
      <v-dialog
        v-model="signing"
        hide-overlay
        :persistent="!!signingTime || signingTime > 1"
        width="30%"
      >
        <v-card>
          <v-card-text>
            <div class="text-h4 text-center pt-6">Sign Message To Log In</div>
            <div
              class="text-center d-flex justify-center flex-column"
              style="min-height: 150px"
              v-if="signingTime >= 1"
            >
              <v-progress-circular
                class="text-center mx-auto"
                rotate="-90"
                size="60"
                :value="signingTime ? (signingTime / 90) * 100 : 100"
                :color="signingTimerColor"
              >
                <span v-if="signingTimerTextColor">{{ signingTime }}</span>
              </v-progress-circular>
            </div>
            <div
              class="text-center d-flex justify-center flex-column"
              style="min-height: 150px"
              v-if="signing && signingTime < 1"
            >
              <div
                v-if="signing && signingTime < 1"
                class="text-center text-h6 error--text"
              >
                Signature Request Expired
              </div>
              <div
                v-if="signing && signingTime < 1"
                class="text-center text-display error--text"
              >
                Please reject or close the request window
              </div>
            </div>
            <v-expansion-panels accordion>
              <v-expansion-panel>
                <v-expansion-panel-header
                  >Learn More About Web3
                  Authentication</v-expansion-panel-header
                >
                <v-expansion-panel-content>
                  <p>
                    VLM allows you to log in by signing an encrypted message to
                    prove that you are the true owner of your Web3 wallet.
                  </p>
                  <p>
                    The message should look <strong>exactly</strong> like the
                    one below.
                  </p>
                  <v-textarea :value="signatureMessage" disabled></v-textarea>
                  <p>
                    You will not be asked to pay a fee or be asked for
                    permission to transfer tokens. If this occurs, please
                    contact support.
                  </p>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-dialog>
      <div class="bg">
        <router-view />
      </div>
    </v-main>
    <v-footer
      >Virtual Land Manager
      <span v-if="environment !== 'production'" class="ml-1">
        | {{ environment.toUpperCase() }}
      </span>
    </v-footer>
  </v-app>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import { DateTime, Interval } from "luxon";

export default {
  name: "App",

  data: () => ({
    signingTime: null,
  }),
  computed: {
    walletAddress() {
      const fullAddress = this.$store.state.auth?.userInfo?.connectedWallet;
      if (!fullAddress) {
        return "";
      }
      const truncAddress =
        fullAddress &&
        fullAddress.substring(0, 6) +
          "..." +
          fullAddress.substring(fullAddress.length - 5);
      return truncAddress;
    },
    environment() {
      return process.env.VUE_APP_NODE_ENV;
    },
    signingTimerColor() {
      if ((this.signingTime / 90) * 100 > 33) {
        return "white";
      } else if ((this.signingTime / 90) * 100 > 10) {
        return "yellow";
      } else {
        return "red";
      }
    },
    signingTimerTextColor() {
      if ((this.signingTime / 90) * 100 > 33) {
        return "";
      } else if ((this.signingTime / 90) * 100 > 10) {
        return "yellow--text";
      } else {
        return "error--text";
      }
    },
    ...mapGetters("auth", ["connected", "signing"]),
    ...mapState("auth", ["loggingIn", "sigTokenExpires", "signatureMessage"]),
  },
  methods: {
    connectButton() {
      const interval = setInterval(() => {
        if (
          !this.sigTokenExpires ||
          DateTime.fromSeconds(this.sigTokenExpires).toSeconds() <
            DateTime.now().toSeconds()
        ) {
          return;
        }
        this.signingTime = Interval.fromDateTimes(
          DateTime.now(),
          DateTime.fromSeconds(this.sigTokenExpires)
        )
          .toDuration(["seconds"])
          .toFormat("s");

        if (
          this.connected ||
          this.sigTokenExpires <= DateTime.now().toUnixInteger()
        ) {
          clearInterval(interval);
          this.signingTime = null;
        }
      }, 1000);
      this.connect();
    },
    ...mapActions("auth", ["connect", "fetchAccount"]),
  },
};
</script>

<style scoped>
.header-link {
  line-height: 0;
}

.bg {
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: url("assets/VLM-BG.jpg") no-repeat center center;
  background-size: cover;
  transform: scale(1);
}
</style>
