<template>
  <v-container class="content pb-0">
    <v-card class="translucent content pb-0">
      <v-row>
        <v-col>
          <v-img
            src="@/assets/VLM-Logo-Color.svg"
            max-width="33%"
            class="mx-auto logo"
          />
          <div class="font-weight-black text-h4 text-center">
            Your Virtual Assistant for the Virtual World
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-container>
            <v-row class="px-6">
              <v-col>
                <v-card class="translucent text-center pa-3">
                  <div class="text-overline text-center">
                    SCENE ANALYTICS
                  </div>
                  <v-icon size="124px">mdi-chart-line</v-icon>
                  <div class="text-display-1 text-center px-3">
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title
                          >View and export data about how people are interacting
                          with your land</v-list-item-title
                        >
                        <v-list-item-title
                          >Add custom tracking events from within SDK scenes
                          using a simple line of code</v-list-item-title
                        >
                      </v-list-item-content>
                    </v-list-item>
                  </div>
                </v-card>
              </v-col>
              <v-col>
                <v-card class="translucent text-center pa-3">
                  <div class="text-overline text-center">
                    REAL-TIME SCENE MANAGEMENT
                  </div>
                  <v-icon size="124px">mdi-cube-outline</v-icon>
                  <div class="text-display-1 text-center px-3">
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title
                          >Build customized experiences in real
                          time!</v-list-item-title
                        >
                        <v-list-item-title
                          >Create video screens, images, and
                          NFTs.</v-list-item-title
                        >
                        <v-list-item-title
                          >Move them around and turn them on or
                          off.</v-list-item-title
                        >
                      </v-list-item-content>
                    </v-list-item>
                  </div>
                </v-card>
              </v-col>
              <v-col>
                <v-card class="translucent text-center pa-3">
                  <div class="text-overline text-center">
                    SCENE MODERATION TOOLS
                  </div>
                  <v-icon size="124px">mdi-gavel</v-icon>
                  <div class="text-display-1 text-center px-3">
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title
                          >Ban certain names or items from your
                          scene</v-list-item-title
                        >
                        <v-list-item-title
                          >Restrict access to only allow certain people or
                          items</v-list-item-title
                        >
                        <v-list-item-title
                          >Block trolls and toxic troublemakers from interacting
                          with others on your land</v-list-item-title
                        >
                      </v-list-item-content>
                    </v-list-item>
                  </div>
                </v-card>
              </v-col>
              <v-col>
                <v-card class="translucent text-center pa-3">
                  <div class="text-overline text-center">
                    SDK CUSTOMIZATIONS
                  </div>
                  <v-icon size="124px">mdi-tune</v-icon>
                  <div class="text-display-1 text-center px-3">
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title
                          >Create your own toggles, menus, text fields, and
                          buttons to trigger custom code within your
                          scene</v-list-item-title
                        >
                      </v-list-item-content>
                    </v-list-item>
                  </div>
                </v-card>
              </v-col>

              <v-col>
                <v-card class="translucent text-center pa-3">
                  <div class="text-overline text-center">
                    EVENT GIVEAWAYS
                  </div>
                  <v-icon size="124px">mdi-tshirt-v</v-icon>
                  <div class="text-display-1 text-center">
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title
                          >Schedule events on your land and offer giveaways of
                          Decentraland wearables or emotes.</v-list-item-title
                        ><v-list-item-title
                          >Virtual Land Manager uses various security methods to
                          make sure your giveaway is not abused by
                          collectors</v-list-item-title
                        >
                      </v-list-item-content>
                    </v-list-item>
                  </div>
                  <div
                    class="text-overline text-center purple--text text--lighten-2"
                  >
                    COMING SOON!
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="text-center">
          <div class="font-weight-black text-overline text-center mb-6">
            THE METAVERSE AWAITS
          </div>
          <v-btn
            rounded
            color="primary"
            x-large
            class="mb-6"
            @click.stop="connect()"
          >
            GET STARTED
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Home',
  methods: {
    ...mapActions(['connect', 'fetchAccount'])
  }
}
</script>

<style scoped>
.logo {
  left: -2vw;
}
.translucent {
  background: rgba(20, 20, 20, 0.75);
}
</style>
