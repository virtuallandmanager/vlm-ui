<template>
  <v-navigation-drawer app class="pt-2" v-model="navDrawerOpen">
    <v-list dense>
      <v-list-item>
        <v-list-item-content>
          <v-img src="@/assets/VLM-Logo-Color.svg" align="center" max-height="70" contain></v-img>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-divider></v-divider>
    <v-list nav dense v-if="demoMode">
      <v-list-item>
        <v-list-item-icon>
          <v-icon>mdi-test-tube</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Public Demo Mode</v-list-item-title>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>
          <v-btn color="red" @click="jumpIn">Jump In</v-btn>
          <div class="text-caption text-center mt-2 grey--text text--lighten-1" style="font-size: 8px">SEE YOUR CHANGES IN REAL TIME</div>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-list nav dense v-if="showBackArrow">
      <v-list-item link @click="goBack">
        <v-list-item-icon>
          <v-icon>mdi-chevron-left</v-icon>
        </v-list-item-icon>
        <v-list-item-title>{{ previousRoute }}</v-list-item-title>
      </v-list-item>
    </v-list>
    <v-divider v-if="showBackArrow"></v-divider>

    <v-list nav dense>
      <v-list-item link to="/scenes">
        <v-list-item-icon>
          <v-icon>mdi-island</v-icon>
        </v-list-item-icon>
        <v-list-item-title>{{ navText('Scenes') }}</v-list-item-title>
      </v-list-item>

      <v-list-item link to="/events">
        <v-list-item-icon>
          <v-icon>mdi-calendar-star</v-icon>
        </v-list-item-icon>
        <v-list-item-title>{{ navText('Events') }}</v-list-item-title>
      </v-list-item>
      <v-list-item link to="/giveaways">
        <v-list-item-icon>
          <v-icon>mdi-gift</v-icon>
        </v-list-item-icon>
        <v-list-item-title>{{ navText('Giveaways') }}</v-list-item-title>
      </v-list-item>
      <!-- <v-list-item link to="/media" disabled>
        <v-list-item-icon>
          <v-icon disabled>mdi-folder-multiple-image</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Media Library</v-list-item-title>
      </v-list-item> -->
      <v-list-item link to="/streams">
        <v-list-item-icon>
          <v-icon>mdi-video</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Video Streams</v-list-item-title>
      </v-list-item>
      <v-list-item link :href="docsUrl">
        <v-list-item-icon>
          <v-icon>mdi-book</v-icon>
        </v-list-item-icon>
        <v-list-item-title>{{ navText('Docs') }}</v-list-item-title>
      </v-list-item>
      <!-- <v-list-item link to="/organizations" v-if="orgAdmin">
        <v-list-item-icon>
          <v-icon>mdi-account-group-outline</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Organizations</v-list-item-title>
      </v-list-item> -->
      <v-list-item link to="/admin" v-if="vlmAdmin">
        <v-list-item-icon>
          <v-icon>mdi-shield-account</v-icon>
        </v-list-item-icon>
        <v-list-item-title>{{ navText('Admin Panel') }}</v-list-item-title>
      </v-list-item>
    </v-list>
    <template v-slot:append>
      <div class="pa-2">
        <div class="text-caption text-center">{{ user?.displayName }}</div>

        <v-btn text block><v-icon class="pr-2">mdi-wallet</v-icon> {{ walletAddress(8, 4) }}</v-btn>
      </div>
      <div class="pa-2">
        <v-btn block @click="loadUserProfile">{{ navText('User Profile') }}</v-btn>
      </div>
      <div class="pa-2">
        <v-btn block @click="logout">{{ navText('Log Out') }}</v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'LeftNav',
  data: () => ({
    previousRoute: '',
  }),
  created() {
    this.$router.beforeEach((to, from, next) => {
      this.previousRoute = from.name
      next()
    })
  },
  computed: {
    activeScene() {
      return this.$store.state.scene?.activeScene
    },
    activeEvent() {
      return this.$store.state.event?.activeEvent
    },
    advancedUser() {
      return !!this.user?.roles?.includes(2)
    },
    orgAdmin() {
      return !!this.user?.roles?.includes(4)
    },
    vlmAdmin() {
      return !!this.user?.roles?.filter((role) => role >= 7).length
    },
    showBackArrow() {
      return (this.previousRoute && this.activeScene) || this.activeEvent
    },
    docsUrl() {
      return process.env.VUE_APP_DOCS_URL
    },
    ...mapGetters({
      navText: 'i18n/navigation',
      demoMode: 'app/demoMode',
      user: 'user/userInfo',
      demoScene: 'scene/demoScene',
      walletAddress: 'user/walletAddress',
    }),
    navDrawerOpen: {
      get() {
        return this.$store.state.app.navDrawerOpen
      },
      set(value) {
        if (value) {
          return
        } else {
          this.closeNavDrawer()
        }
      },
    },
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    closeNavDrawer() {
      this.setNavDrawerState(false)
    },
    jumpIn() {
      window.open(this.demoScene.sceneUrl, '_blank')
    },
    ...mapActions({
      logout: 'auth/disconnect',
      setNavDrawerState: 'app/setNavDrawerState',
      toggleNavDrawer: 'app/toggleNavDrawer',
    }),
    loadUserProfile() {
      this.$router.push('/profile')
    },
  },
}
</script>
<style scoped>
.cyberpunk-border {
  border: 1px solid rgb(128, 0, 255);
}

.subpanel-header {
  border: 1px solid rgb(128, 0, 255);
  background-color: rgb(128, 0, 255);
}
</style>
