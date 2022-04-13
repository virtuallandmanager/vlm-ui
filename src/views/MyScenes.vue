<template>
  <v-sheet elevation="2" class="px-4 mx-auto fill-height" max-width="960">
    <v-container class="">
      <v-row class="text-left">
        <v-col>
          <div class="float-right">
            <v-btn tile disabled to="/scene/create">
              <v-icon left>mdi-import</v-icon>
              Create New Scene
            </v-btn>
          </div>
          <h1 class="display-2 font-weight-light mb-3">Scenes</h1>
        </v-col>
      </v-row>
      <v-row class="text-center" v-if="!userScenes.length">
        <v-col cols="12">
          <div class="text-h5">No scenes found.</div>
          <div class="text-body">
            Please <router-link to="/scene/create">create</router-link> a new scene.
          </div>
        </v-col>
      </v-row>
      <v-row class="text-center">
        <v-col cols="12" v-for="(property, i) in userLand" :key="i">
          <router-link
            :to="getSlug(property.baseParcel)"
            class="parcel-card-link"
          >
            <parcel-card :property="property" />
          </router-link>
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
</template>

<script>
import { mapActions } from "vuex";
import ParcelCard from "../components/ParcelCard";
export default {
  components: { ParcelCard },
  name: "MyScenes",
  data: () => ({}),
  mounted() {
    this.fetchUserScenes();
  },
  computed: {
    userScenes() {
      return this.$store.state.scenes.userScenes;
    },
  },
  methods: {
    ...mapActions({
      fetchUserScenes: "scenes/fetchUserScenes",
    }),
    getSlug: (baseParcel) => {
      return "land/" + baseParcel.join("/");
    },
  },
};
</script>

<style scoped>
.parcel-card-link {
  text-decoration: none;
}
</style>
