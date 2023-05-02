<template>
  <v-sheet elevation="2" class="px-4 mx-auto fill-height" max-width="1024">
    <v-container class="">
      <v-row class="text-center mb-12" v-if="loading">
        <v-col>
          <div class="text-h5">WELCOME</div>
        </v-col>
      </v-row>
      <v-row class="text-center" v-if="!scenes.length && !loading">
        <v-col cols="12">
          <v-card
            width="420px"
            class="pa-6 my-6 mx-auto grey d-flex flex-column justify-space-between"
          >
            <div v-for="(org, i) of userOrgs" :key="i" class="text-left">
              <div class="text-body-1" v-if="org">
                {{ org?.displayName }}
              </div>
              <div
                class="text-caption grey--text text--darken-2 text-left"
                v-if="org.displayName"
              >
                ORGANIZATION
              </div>
            </div>
            <div class="mb-4">
              <div class="text-h5 text-center" v-if="userInfo?.displayName">
                {{ userInfo?.displayName }}
              </div>
              <div
                class="text-caption grey--text text--darken-2 text-center"
                v-if="userInfo?.displayName"
              >
                MEMBER NAME
              </div>
            </div>
            <div class="d-flex justify-space-between">
              <div class="text-caption ma-0 pa-0" v-if="userInfo?.registeredAt">
                Member Since {{ memberSince }}
              </div>
              <div
                class="text-right text-caption grey--text text--darken-2"
                v-if="earlyAccess"
              >
                EARLY ACCESS MEMBER
              </div>
            </div>
          </v-card>
          <div class="text-body">
            Thank you for signing up for VLM Early Access!
          </div>
          <div class="text-body mt-4">
            For progress updates, please
            <a href="https://discord.gg/hYzxFZmbvf"
              >Join the VLM Discord server</a
            >.
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
</template>

<script>
import { mapGetters } from "vuex";
import store from "../store";
import { DateTime } from "luxon";

export default {
  name: "Welcome",
  data: () => ({
    loading: false,
  }),
  mounted() {},
  computed: {
    userInfo() {
      return store.state.user.userInfo;
    },
    userOrgs() {
      return store.state.organization.userOrgs;
    },
    earlyAccess() {
      return store.state.user.userInfo?.roles?.includes(1);
    },
    ...mapGetters({
      scenes: "scene/sceneList",
    }),
    memberSince() {
      return DateTime.fromSeconds(this.userInfo.registeredAt).toLocaleString();
    },
  },
  methods: {},
};
</script>

<style scoped>
.scene-card-link {
  text-decoration: none;
}
</style>
