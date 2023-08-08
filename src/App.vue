<template>
  <v-app>
    <v-app-bar app clipped-left color="production" class="d-flex align-center" v-if="$vuetify.breakpoint.mdAndDown">
      <v-app-bar-nav-icon @click.stop="toggleNavDrawer" v-if="$vuetify.breakpoint.mdAndDown && showNav"></v-app-bar-nav-icon>
      <v-img src="@/assets/VLM-Logo.svg" max-width="80" class="ml-2"></v-img>
      <v-btn v-if="!connected && !signing" color="primary" @click.stop="connectButton()" :loading="processing" :disabled="processing" fixed right>
        <v-icon class="mr-2">mdi-wallet</v-icon>
        Connect Wallet
        <template v-slot:loading><v-progress-circular indeterminate :size="15" class="mr-2" /> Connecting</template>
      </v-btn>
      <v-btn v-else-if="signing && signature" color="primary" @click.stop="connectButton()" :disabled="processing" fixed right>
        <v-progress-circular indeterminate :size="15" class="mr-2" />
        Validating
      </v-btn>
      <v-btn v-else-if="signing && !signature" color="primary" @click.stop="connectButton()" :disabled="processing" fixed right> <v-progress-circular indeterminate :size="15" class="mr-2" /> Please Sign </v-btn>
    </v-app-bar>
    <v-main>
      <web-3-signing-dialog :value="signing" />
      <left-nav v-if="connected && showNav" />
      <div class="bg">
        <router-view />
        <v-app-bar fixed right color="transparent" align-right elevation="0" v-if="!connected && !$vuetify.breakpoint.mdAndDown">
          <v-btn v-if="!connected && !signing" color="primary" @click.stop="connectButton()" :loading="processing" :disabled="processing" fixed right>
            <v-icon class="mr-2">mdi-wallet</v-icon>
            Connect Wallet
            <template v-slot:loading><v-progress-circular indeterminate :size="15" class="mr-2" /> Connecting</template>
          </v-btn>
          <v-btn v-else-if="signing && signature" color="primary" @click.stop="connectButton()" :disabled="processing" fixed right>
            <v-progress-circular indeterminate :size="15" class="mr-2" />
            Validating
          </v-btn>
          <v-btn v-else-if="signing && !signature" color="primary" @click.stop="connectButton()" :disabled="processing" fixed right> <v-progress-circular indeterminate :size="15" class="mr-2" /> Please Sign </v-btn>
        </v-app-bar>
      </div>
    </v-main>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" bottom center>
      {{ snackbar.message }}
    </v-snackbar>
  </v-app>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import { DateTime, Interval } from "luxon";
import Web3SigningDialog from "./components/dialogs/Web3SigningDialog";
import LeftNav from "./components/LeftNav";

export default {
  name: "App",

  data: () => ({
    signingTime: null,
  }),
  components: { Web3SigningDialog, LeftNav },
  mounted() {
    this.setWindowSize();
  },
  computed: {
    snackbar() {
      return this.$store.state.banner;
    },
    hasError() {
      return !!this.errorMessage;
    },
    hasWarning() {
      return !!this.warningMessage;
    },
    hasSuccess() {
      return !!this.successMessage;
    },
    environment() {
      return process.env.NODE_ENV;
    },
    connectedWallet() {
      return this.$store.getters["auth/walletAddress"](6, 4);
    },
    ...mapGetters({
      connected: "auth/authenticated",
      showNav: "app/showNav",
      processing: "auth/processing",
      signing: "auth/signing",
      sigTokenExpires: "auth/sigTokenExpires",
      signature: "auth/signature",
    }),
    ...mapState({
      signatureMessage: "auth/signatureMessage",
      errorMessage: "banner/errorMessage",
      warningMessage: "banner/warningMessage",
      successMessage: "banner/successMessage",
      messageTimeout: "banner/timeout",
    }),
  },
  methods: {
    connectButton() {
      const interval = setInterval(() => {
        if (!this.sigTokenExpires || DateTime.fromSeconds(this.sigTokenExpires).toSeconds() < DateTime.now().toSeconds()) {
          return;
        }
        this.signingTime = Interval.fromDateTimes(DateTime.now(), DateTime.fromSeconds(this.sigTokenExpires)).toDuration(["seconds"]).toFormat("s");

        if (this.connected || this.sigTokenExpires <= DateTime.now().toUnixInteger()) {
          clearInterval(interval);
          this.signingTime = null;
        }
      }, 1000);
      this.connectWallet();
    },
    logOut() {
      this.disconnect();
    },
    setWindowSize() {
      const mdAndUp = this.$vuetify.breakpoint.mdAndUp;
      this.setNavDrawerState(mdAndUp);
    },
    ...mapActions({
      toggleNavDrawer: "app/toggleNavDrawer",
      connectWallet: "auth/connectWallet",
      setNavDrawerState: "app/setNavDrawerState",
      disconnect: "auth/disconnect",
    }),
  },
};
</script>

<style>
.header-link {
  line-height: 0;
}

.bg {
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: url("assets/web-bg.jpg") no-repeat center center;
  background-size: cover;
  transform: scale(1);
}
.translucent {
  background-color: rgba(0, 0, 0, 0);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}
</style>
