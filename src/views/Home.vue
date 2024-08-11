<template>
  <v-container class="content pb-0">
    <v-row>
      <v-col>
        <v-img src="@/assets/VLM-Logo-Color.svg" max-width="25vw" class="mx-auto logo" />
        <div class="font-weight-black text-h4 text-center">{{ localText('Tagline') }}</div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-container>
          <v-row class="px-6">
            <v-col>
              <v-card class="translucent text-center pa-3">
                <div class="text-overline text-center">CROSS-METAVERSE SCENE MANGEMENT</div>
                <div class="d-flex justify-center">
                  <img src="@/assets/dcl-logo.png" width="50px" height="50px" class="ma-2" />
                  <div class="d-flex ma-2">
                    <img src="@/assets/hyperfy-logo.png" width="50px" height="50px" />
                    <div class="purple--text text--lighten-2 ml-n3 mb-n3">*</div>
                  </div>
                </div>
                <v-icon size="124px">mdi-arrow-decision</v-icon>
                <div class="text-display-1 text-center px-3">
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Manage your scene across multiple metaverses</v-list-item-title>
                      <v-list-item-title>VLM plans to integrate as many of our features across as many metaverses as possible!</v-list-item-title>
                      <div class="text-overline text-center purple--text text--lighten-2">*COMING SOON!</div>
                    </v-list-item-content>
                  </v-list-item>
                </div>
              </v-card>
            </v-col>
            <v-col>
              <v-card class="translucent text-center pa-3">
                <div class="text-overline text-center">SCENE ANALYTICS</div>
                <v-icon size="124px">mdi-chart-line</v-icon>
                <div class="text-display-1 text-center px-3">
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>View and export data about how people are interacting with your experiences</v-list-item-title>
                      <v-list-item-title>Add custom tracking events to your virtual experiences using a simple line of code</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </div>
              </v-card>
            </v-col>
            <v-col>
              <v-card class="translucent text-center pa-3">
                <div class="text-overline text-center">REAL-TIME SCENE MANAGEMENT</div>
                <v-icon size="124px">mdi-cube-outline</v-icon>
                <div class="text-display-1 text-center px-3">
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Manage video screens, images, 3D models, sounds, and more.</v-list-item-title>
                      <v-list-item-title>Move, size, rotate, and enable or disable all of your assets in real time.</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </div>
              </v-card>
            </v-col>
            <v-col>
              <v-card class="translucent text-center pa-3">
                <div class="text-overline text-center">SCENE MODERATION TOOLS</div>
                <v-icon size="124px">mdi-gavel</v-icon>
                <div class="text-display-1 text-center px-3">
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Ban certain names or wearables from your scene</v-list-item-title>
                      <v-list-item-title>Restrict access to only allow certain people or items</v-list-item-title>
                      <v-list-item-title>Block trolls and toxic troublemakers from interacting with others on your land</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </div>
              </v-card>
            </v-col>
            <v-col>
              <v-card class="translucent text-center pa-3">
                <div class="text-overline text-center">CUSTOMIZED CONTROLS</div>
                <v-icon size="124px">mdi-tune</v-icon>
                <div class="text-display-1 text-center px-3">
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title
                        >Create your own toggles, menus, text fields, sliders, and buttons to trigger custom code within your scene</v-list-item-title
                      >
                    </v-list-item-content>
                  </v-list-item>
                </div>
              </v-card>
            </v-col>

            <v-col>
              <v-card class="translucent text-center pa-3">
                <div class="text-overline text-center">EVENT GIVEAWAYS</div>
                <v-icon size="124px">mdi-tshirt-v</v-icon>
                <div class="text-display-1 text-center">
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Schedule events on your land and offer giveaways of Decentraland wearables or emotes.</v-list-item-title
                      ><v-list-item-title
                        >Virtual Land Manager uses various security methods to make sure your giveaway is not abused by collectors</v-list-item-title
                      >
                    </v-list-item-content>
                  </v-list-item>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="text-center">
        <div class="font-weight-black text-overline text-center mb-6">THE METAVERSE AWAITS</div>
        <v-btn rounded color="primary" x-large class="mb-6" @click.stop="connect()"> GET STARTED </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import store from '../store'

export default {
  name: 'Home',
  beforeRouteEnter(to, from, next) {
    const isAuthenticated = store.getters['auth/authenticated']
    // const isAdmin = store.getters["user/isVLMAdmin"];
    if (isAuthenticated) {
      // next("/scenes"); // Redirect to the scenes page if the user is authenticated
    } else {
      next() // Continue rendering the component
    }
  },
  computed: {
    ...mapGetters({ localText: 'i18n/home' }),
  },
  methods: {
    ...mapActions({ connect: 'auth/connectWallet' }),
  },
}
</script>

<style scoped>
.logo {
  left: -2vw;
}

.translucent {
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}
</style>
