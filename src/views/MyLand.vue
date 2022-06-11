<template>
  <v-sheet elevation="2" class="px-4 mx-auto fill-height" max-width="960">
    <v-container class="">
      <v-row class="text-left">
        <v-col>
          <div class="float-right">
            <v-btn tile to="/land/import">
              <v-icon left>mdi-import</v-icon>
              Import Parcels
            </v-btn>
          </div>
          <h1 class="display-2 font-weight-light mb-3">Land</h1>
        </v-col>
      </v-row>
      <loader
        message="Loading your land..."
        :loading="fetchingUserLand"
        :grid="true"
      />
      <v-row class="text-center" v-if="!userLand.length && !fetchingUserLand">
        <v-col cols="12">
          <div class="text-h5">No land parcels found.</div>
          <div class="text-body">
            Please <router-link to="/land/import">import</router-link> parcels
            that you would like to manage with VLM.
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
import { mapActions, mapGetters } from "vuex";
import ParcelCard from "../components/ParcelCard";
import Loader from "../components/Loader";
export default {
  components: { ParcelCard, Loader },
  name: "MyLand",
  data: () => ({}),
  mounted() {
    this.fetchUserLand();
  },
  computed: {
    userLand() {
      return this.$store.state.land.userLand;
    },
    ...mapGetters({
      fetchingUserLand: "land/fetchingUserLand",
    }),
  },
  methods: {
    ...mapActions({
      fetchUserLand: "land/fetchUserLand",
    }),
    getSlug: (baseParcel) => {
      return "land/" + baseParcel.split(",").join("/");
    },
  },
};
</script>

<style scoped>
.parcel-card-link {
  text-decoration: none;
}
</style>
