<template>
  <v-app>
    <v-app-bar app clipped-left color="production" class="d-flex align-center" v-if="$vuetify.breakpoint.mdAndDown && $route.path !== '/'">
      <v-app-bar-nav-icon @click.stop="toggleNavDrawer" v-if="$vuetify.breakpoint.mdAndDown && !unregistered"></v-app-bar-nav-icon>
      <v-img src="@/assets/VLM-Logo.svg" max-width="80" class="ml-2"></v-img>
      <v-btn v-if="!connected && !signing" color="primary" @click.stop="connectButton()" :loading="loadingAuth" :disabled="loadingAuth" fixed right>
        <v-icon class="mr-2">mdi-wallet</v-icon>
        Connect Wallet
        <template v-slot:loading><v-progress-circular indeterminate :size="15" class="mr-2" /> Connecting</template>
      </v-btn>
      <v-btn v-else-if="signing && signature" color="primary" @click.stop="connectButton()" :disabled="loadingAuth" fixed right>
        <v-progress-circular indeterminate :size="15" class="mr-2" />
        Validating
      </v-btn>
      <v-btn v-else-if="signing && !signature" color="primary" @click.stop="connectButton()" :disabled="loadingAuth" fixed right>
        <v-progress-circular indeterminate :size="15" class="mr-2" /> Please Sign
      </v-btn>
    </v-app-bar>
    <v-main>
      <web-3-signing-dialog :value="signing" />
      <left-nav v-if="connected && showNav && !unregistered && $route.path !== '/'" />
      <div class="bg">
        <router-view />
        <v-app-bar
          fixed
          right
          color="transparent"
          align-right
          elevation="0"
          v-if="(!connected && !$vuetify.breakpoint.mdAndDown) || $route.path === '/'"
        >
          <v-btn
            v-if="!connected && !signing"
            color="primary"
            @click.stop="connectButton()"
            :loading="loadingAuth"
            :disabled="loadingAuth"
            fixed
            right
          >
            <v-icon class="mr-2">mdi-wallet</v-icon>
            Connect Wallet
            <template v-slot:loading><v-progress-circular indeterminate :size="15" class="mr-2" /> Connecting</template>
          </v-btn>
          <v-btn v-else-if="signing && signature" color="primary" @click.stop="connectButton()" :disabled="loadingAuth" fixed right>
            <v-progress-circular indeterminate :size="15" class="mr-2" />
            Validating
          </v-btn>
          <v-btn v-else-if="signing && !signature" color="primary" @click.stop="connectButton()" :disabled="loadingAuth" fixed right>
            <v-progress-circular indeterminate :size="15" class="mr-2" /> Please Sign
          </v-btn>
        </v-app-bar>
      </div>
    </v-main>
    <v-footer app class="d-flex py-2 my-0">
      <p class="text-body1 my-0 pa-1">vlm.gg</p>
      <v-spacer></v-spacer>
      <div v-for="(icon, i) in footerIcons" :key="i">
        <v-btn
          class="mx-4"
          dark
          icon
          small
          @click="
            {
              icon.name == 'Bug Report' ? openBugReportDialog() : openLink(icon.link)
            }
          "
        >
          <v-img v-if="icon?.local" :src="require(`@/assets/${icon.icon}.svg`)" max-height="20px" max-width="20px" contain />
          <v-icon v-else size="24px">{{ icon.icon }}</v-icon>
        </v-btn>
      </div>
      <bug-report-dialog v-if="showBugReport" v-model="showBugReport" />
    </v-footer>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" bottom center>
      {{ snackbar.message }}
    </v-snackbar>
  </v-app>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import { DateTime, Interval } from 'luxon'
import Web3SigningDialog from './components/dialogs/Web3SigningDialog'
import LeftNav from './components/LeftNav'
import BugReportDialog from './components/dialogs/BugReportDialog'

export default {
  name: 'App',

  data: () => ({
    signingTime: null,
    footerIcons: [
      {
        name: 'Bug Report',
        icon: 'mdi-bug',
      },
      {
        name: 'Discord',
        icon: 'discord-logo',
        local: true,
        link: 'https://discord.gg/zSMq8YvKYX',
      },
      {
        name: 'X',
        icon: 'x-app-logo',
        local: true,
        link: 'https://x.com/virtuallandmngr',
      },
      {
        name: 'GitHub',
        icon: 'mdi-github',
        link: 'https://www.github.com/virtuallandmanager',
      },
    ],
  }),
  components: { Web3SigningDialog, LeftNav, BugReportDialog },
  mounted() {
    this.setWindowSize()
  },
  computed: {
    snackbar() {
      return this.$store.state.banner
    },
    hasError() {
      return !!this.errorMessage
    },
    hasWarning() {
      return !!this.warningMessage
    },
    hasSuccess() {
      return !!this.successMessage
    },
    environment() {
      return process.env.NODE_ENV
    },
    connectedWallet() {
      return this.$store.getters['auth/walletAddress'](6, 4)
    },
    showBugReport: {
      get() {
        return this.$store.state.logs.showBugReport
      },
      set(value) {
        this.$store.commit('logs/SET_BUG_REPORT_DIALOG', value)
      },
    },
    ...mapGetters({
      connected: 'auth/authenticated',
      showNav: 'app/showNav',
      loadingAuth: 'auth/loadingAuth',
      signing: 'auth/signing',
      sigTokenExpires: 'auth/sigTokenExpires',
      signature: 'auth/signature',
      unregistered: 'user/unregistered',
    }),
    ...mapState({
      signatureMessage: 'auth/signatureMessage',
      errorMessage: 'banner/errorMessage',
      warningMessage: 'banner/warningMessage',
      successMessage: 'banner/successMessage',
      messageTimeout: 'banner/timeout',
    }),
  },
  methods: {
    connectButton() {
      const interval = setInterval(() => {
        if (!this.sigTokenExpires || this.sigTokenExpires < DateTime.now().toMillis()) {
          return
        }
        this.signingTime = Interval.fromDateTimes(DateTime.now(), DateTime.fromMillis(this.sigTokenExpires)).toDuration(['seconds']).toFormat('s')

        if (this.connected || this.sigTokenExpires <= DateTime.now().toMillis()) {
          clearInterval(interval)
          this.signingTime = null
        }
      }, 1000)
      this.connectWallet()
    },
    logOut() {
      this.disconnect()
    },
    openLink(link) {
      if (!link) return
      window.open(link, '_blank')
    },
    setWindowSize() {
      const mdAndUp = this.$vuetify.breakpoint.mdAndUp
      this.setNavDrawerState(mdAndUp)
    },
    openBugReportDialog() {
      this.toggleBugReportDialog(true)
    },
    ...mapActions({
      toggleNavDrawer: 'app/toggleNavDrawer',
      connectWallet: 'auth/connectWallet',
      setNavDrawerState: 'app/setNavDrawerState',
      toggleBugReportDialog: 'logs/toggleBugReportDialog',
      disconnect: 'auth/disconnect',
    }),
  },
}
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
  background: url('assets/web-bg.jpg') no-repeat center center;
  background-size: cover;
  transform: scale(1);
}

.translucent {
  background-color: rgba(0, 0, 0, 0);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.v-tab {
  text-transform: uppercase !important;
}
</style>
