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
          <v-tab v-if="connected">My Scenes</v-tab>
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
      return process.env.VUE_APP_NODE_ENV
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
