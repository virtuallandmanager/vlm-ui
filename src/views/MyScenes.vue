<template>
  <v-sheet elevation="2" class="px-4 mx-auto fill-height" max-width="960">
    <v-container class="">
      <v-row class="text-left">
        <v-col>
          <h1 class="display-2 font-weight-light mb-3">My Scenes</h1>
        </v-col>
      </v-row>
      <v-row class="text-center mb-12" v-if="fetchingUserLand">
        <v-col>
          <loader
            message="Loading your land..."
            :loading="fetchingUserLand"
            :grid="true"
          />
        </v-col>
      </v-row>
      <v-row class="text-center" v-if="!userLand.length && !fetchingUserLand">
        <v-col cols="12">
          <div class="text-h5">No scenes found.</div>
          <div class="text-body mt-4">
            Wiki page coming soon with instructions on installing VLM.
          </div>
          <div class="text-body mb-4">
            For developer preview, contact Unknower#0677 on Discord.
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
import { mapActions, mapGetters } from 'vuex'
import ParcelCard from '../components/ParcelCard'
import Loader from '../components/Loader'
export default {
  components: { ParcelCard, Loader },
  name: 'MyScenes',
  data: () => ({}),
  mounted () {
    this.fetchUserLand()
  },
  computed: {
    userLand () {
      return this.$store.state.land.userLand
    },
    ...mapGetters({
      fetchingUserLand: 'land/fetchingUserLand'
    })
  },
  methods: {
    ...mapActions({
      fetchUserLand: 'land/fetchUserLand'
    }),
    getSlug: baseParcel => {
      return 'land/' + baseParcel.split(',').join('/')
    }
  }
}
</script>

<style scoped>
.parcel-card-link {
  text-decoration: none;
}
</style>
