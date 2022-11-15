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
        <v-tabs align-with-title color="nav">
          <!-- <v-tab v-if="!connected">About</v-tab> -->
          <!-- <v-tab v-if="!connected">Pricing</v-tab> -->
          <v-tab v-if="connected">My Land</v-tab>
          <!-- <v-tab>Wiki</v-tab> -->
        </v-tabs>
      </template>
      <v-spacer></v-spacer>
      <v-btn icon class="mr-2" href="https://discord.gg/hYzxFZmbvf" target="_blank">
        <img src="@/assets/discord-logo.svg" height="30" />
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn
        v-if="!connected"
        rounded
        color="primary"
        @click.stop="login()"
        :loading="loggingIn"
      >
        Connect Wallet
        <v-icon class="ml-2">mdi-wallet</v-icon>
      </v-btn>
      <v-dialog
        transition="dialog-top-transition"
        max-width="600"
        v-if="connected"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn rounded color="white" text v-bind="attrs" v-on="on">
            {{ 'Connected: ' + walletAddress }}
          </v-btn>
        </template>
        <template v-slot:default="dialog">
          <v-card>
            <v-toolbar color="primary" dark>Trying to disconnect?</v-toolbar>
            <v-card-text>
              <div class="text-body pa-4">
                For security reasons, you can only disconnect your wallet from
                within your Web3 provider.<br />
                Please open your wallet extension and disconnect from this site
                from there.<br />
                (This is also a good habit to get into when you're done using
                Web3 sites.)
              </div>
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn text @click="dialog.value = false">OK!</v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>
    </v-app-bar>

    <v-main>
      <div :class="!connected && 'bg'">
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
import { mapActions } from 'vuex'

export default {
  name: 'App',

  data: () => ({
    //
  }),
  computed: {
    connected () {
      return this.$store.state.login.connected
    },
    loggingIn () {
      return this.$store.state.login.loggingIn
    },
    walletAddress () {
      const fullAddress = this.$store.state.login.account
      const truncAddress =
        fullAddress &&
        fullAddress.substring(0, 6) +
          '...' +
          fullAddress.substring(fullAddress.length - 5)
      return truncAddress
    },
    environment () {
      return 'production'
      // return process.env.VUE_APP_NODE_ENV
    }
  },
  methods: {
    ...mapActions(['login', 'fetchAccount'])
  }
}
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
  background: url('assets/VLM-BG.jpg') no-repeat center center;
  background-size: cover;
  transform: scale(1);
}
</style>
