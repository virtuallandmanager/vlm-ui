<template>
  <v-container class="content pb-0">
    <v-row>
      <v-col>
        <v-img :src="logo" max-width="25vw" class="mx-auto logo" />
        <div class="font-weight-black text-h4 text-center">{{ localeText('tagline') }}</div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-container v-if="tiles.length">
          <v-row class="px-6">
            <v-col>
              <v-card class="translucent text-center pa-3">
                <div class="text-overline text-center">{{ tiles[0].title }}</div>
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
                      <v-list-item-title>{{ tiles[0].subtitle1 }}</v-list-item-title>
                      <v-list-item-title>{{ tiles[0].subtitle2 }}</v-list-item-title>
                      <div class="text-overline text-center purple--text text--lighten-2">{{ tiles[0].subtitle3 }}</div>
                    </v-list-item-content>
                  </v-list-item>
                </div>
              </v-card>
            </v-col>
            <v-col>
              <v-card class="translucent text-center pa-3">
                <div class="text-overline text-center">{{ tiles[1].title }}</div>
                <v-icon size="124px">mdi-chart-line</v-icon>
                <div class="text-display-1 text-center px-3">
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>{{ tiles[1].subtitle1 }}</v-list-item-title>
                      <v-list-item-title>{{ tiles[1].subtitle2 }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </div>
              </v-card>
            </v-col>
            <v-col>
              <v-card class="translucent text-center pa-3">
                <div class="text-overline text-center">{{ tiles[2].title }}</div>
                <v-icon size="124px">mdi-cube-outline</v-icon>
                <div class="text-display-1 text-center px-3">
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>{{ tiles[2].subtitle1 }}</v-list-item-title>
                      <v-list-item-title>{{ tiles[2].subtitle2 }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </div>
              </v-card>
            </v-col>
            <v-col>
              <v-card class="translucent text-center pa-3">
                <div class="text-overline text-center">{{ tiles[3].title }}</div>
                <v-icon size="124px">mdi-gavel</v-icon>
                <div class="text-display-1 text-center px-3">
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>{{ tiles[3].subtitle1 }}</v-list-item-title>
                      <v-list-item-title>{{ tiles[3].subtitle2 }}</v-list-item-title>
                      <v-list-item-title>{{ tiles[3].subtitle3 }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </div>
              </v-card>
            </v-col>
            <v-col>
              <v-card class="translucent text-center pa-3">
                <div class="text-overline text-center">{{ tiles[4].title }}</div>
                <v-icon size="124px">mdi-tune</v-icon>
                <div class="text-display-1 text-center px-3">
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>{{ tiles[4].subtitle1 }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </div>
              </v-card>
            </v-col>

            <v-col>
              <v-card class="translucent text-center pa-3">
                <div class="text-overline text-center">{{ tiles[5].title }}</div>
                <v-icon size="124px">mdi-tshirt-v</v-icon>
                <div class="text-display-1 text-center">
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>{{ tiles[5].subtitle1 }}</v-list-item-title>
                      <v-list-item-title>{{ tiles[5].subtitle2 }}</v-list-item-title>
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
        <div class="font-weight-black text-overline text-center mb-6">{{ localeText('CTA Text') }}</div>
        <v-btn rounded color="primary" x-large class="mb-6" @click.stop="connect()"> {{ localeText('CTA Button') }} </v-btn>
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
    ...mapGetters({ localeText: 'i18n/home', localeLogo: 'i18n/localeLogo' }),
    logo() {
      const logoFileName = this.localeLogo
      // Resolve the logo file path dynamically using require
      if (logoFileName) {
        return require(`@/assets/${logoFileName}`)
      } else {
        return require('@/assets/VLM-Logo-Color.svg')
      }
    },
    tiles() {
      return this.localeText('tiles') || []
    },
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
