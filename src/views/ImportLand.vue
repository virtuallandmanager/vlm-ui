<template>
  <v-sheet elevation="2" class="pa-6 mx-auto" max-width="960">
    <v-container>
      <v-row>
        <v-col>
          <v-btn @click="goBack">Back</v-btn>
        </v-col>
      </v-row>
      <v-row class="text-left">
        <v-col>
          <h1 class="display-2 font-weight-light mb-3">Land Import</h1>
          <h4 class="display-5 font-weight-bold mb-3">
            Add parcels and estates to be managed by VLM
          </h4>
        </v-col>
      </v-row>
      <v-row class="text-left" v-if="loading">
        <v-col class="text-center">
          <h4 class="display-5 font-weight-bold mx-auto text-center">
            Loading your parcels...
          </h4>
          <v-progress-circular
            indeterminate
            color="primary"
            class="text-center ma-6"
          ></v-progress-circular>
        </v-col>
      </v-row>
      <v-row
        class="text-center"
        v-if="!loading && unimportedParcels.parcels.length"
      >
        <v-col>
          <v-card class="pa-6 fill-height">
            <div class="text-h6">Decentraland Land Parcels</div>
            <div
              class="text-body my-6"
              v-if="!unimportedParcels.parcels.length"
            >
              No parcels found for your account
            </div>
            <div
              cols="4"
              v-for="(parcel, i) in unimportedParcels.parcels"
              :key="i"
              class="d-inline"
            >
              <v-checkbox
                v-model="selectedParcels[i]"
                :label="convertCoords(parcel)"
                class="mx-auto"
              ></v-checkbox>
            </div>
            <v-switch
              v-if="adjacentParcelsPresent"
              v-model="groupParcels"
              label="Group Adjacent Parcels"
            ></v-switch>
          </v-card>
          <v-row class="text-center" v-if="!loading">
            <v-col cols="12">
              <v-btn
                :loading="importingParcels"
                :disabled="importingParcels"
                tile
                color="black"
                class="ma-2 white--text"
                @click="processAndImportParcels()"
              >
                Import Selected
                <v-icon right dark> mdi-upload </v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row
        class="text-center"
        v-if="!loading && unimportedParcels.aetheriaDeeds.length"
      >
        <v-col>
          <v-card class="pa-6 fill-height">
            <div class="text-h6">Aetherian Deed Parcels</div>
            <div
              class="text-body my-6"
              v-if="!unimportedParcels.aetheriaDeeds.length"
            >
              No deeds found for your account
            </div>
            <v-container>
              <v-row>
                <v-col
                  cols="4"
                  v-for="(parcel, i) in unimportedParcels.aetheriaDeeds"
                  :key="i"
                  class="d-inline"
                >
                  <v-checkbox
                    v-model="selectedDeeds[i]"
                    :label="convertCoords(parcel)"
                    class="d-inline mx-auto"
                  ></v-checkbox>
                </v-col>
              </v-row>
              <v-row>
                <v-col v-if="adjacentDeedsPresent">
                  <v-switch
                    v-model="groupDeeds"
                    label="Group Adjacent Parcels"
                  ></v-switch>
                  <div v-for="(group, i) in adjacentDeeds" :key="i">
                    <v-select
                      :items="group.coords"
                      :label="`Base Parcel for Group ${group.group}`"
                    ></v-select>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-col>
      </v-row>
      <v-row class="text-center" v-if="!loading">
        <v-col cols="12">
          <v-btn
            :loading="importingParcels"
            :disabled="importingParcels"
            tile
            color="black"
            class="ma-2 white--text"
            @click="processAndImportParcels()"
          >
            Import Selected
            <v-icon right dark> mdi-upload </v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
</template>

<script>
import { mapState, mapActions } from 'vuex'
// import parcelHelper from '../helpers/parcelHelper'

export default {
  name: 'ImportLand',
  data: () => ({
    selectedParcels: [],
    selectedDeeds: [],
    adjacentParcels: [],
    adjacentDeeds: [],
    adjacentParcelsPresent: false,
    adjacentDeedsPresent: false,
    groupParcels: true,
    groupDeeds: true,
    selectedBaseParcel: null,
    selectedBaseDeed: null
  }),
  mounted () {
    console.log('mounted')
    this.fetchUnimportedParcels()
  },
  computed: {
    ...mapState({
      unimportedParcels: state => state.land.unimportedParcels,
      loading: state => state.land.fetchingParcels,
      importingParcels: state => state.land.importingParcels
    })
  },
  methods: {
    ...mapActions({
      fetchUnimportedParcels: 'land/fetchUnimportedParcels',
      importParcels: 'land/importParcels'
    }),
    // findAdjacentParcels (parcels) {
    //   this.adjacentParcels = parcelHelper.findAdjacentParcels(
    //     parcels,
    //     this.selectedParcels
    //   )
    //   this.adjacentParcelsPresent = this.adjacentParcels.length > 0

    //   if (this.adjacentParcelsPresent) {
    //     this.groupParcels = false
    //   }
    // },
    // findAdjacentDeeds (deeds) {
    //   if (this.selectedDeeds.filter(x => x).length < 2) {
    //     return
    //   }

    //   this.adjacentDeeds = parcelHelper.findAdjacentParcels(
    //     deeds,
    //     this.selectedDeeds
    //   )
    //   console.log('ADJACENT DEEDS: ', this.adjacentDeeds)
    //   this.adjacentDeedsPresent = this.adjacentDeeds.some(
    //     group => group.parcels.length > 1
    //   )

    //   if (this.adjacentDeedsPresent) {
    //     this.groupDeeds = false
    //   }
    // },
    convertCoords (parcel) {
      return `${parcel.x},${parcel.y}`
    },
    async processAndImportParcels() {
      const parcelsToImport = this.unimportedParcels.parcels.filter(
        (parcel, i) => this.selectedParcels[i]
      )
      const deedsToImport = this.unimportedParcels.aetheriaDeeds.filter(
        (parcel, i) => this.selectedDeeds[i]
      )
      console.log(parcelsToImport, deedsToImport)
      await this.importParcels([...parcelsToImport, ...deedsToImport])
      return this.goBack();
    },
    setBaseParcel (baseParcel) {
      this.selectedBaseParcel = [baseParcel.x, baseParcel.y]
      console.log('baseParcel: ', this.selectedBaseParcel)
    },
    setBaseDeed (baseDeed) {
      this.selectedBaseDeed = [baseDeed.x, baseDeed.y]
      console.log('baseDeed: ', this.selectedBaseDeed)
    },
    unsetBaseParcel () {
      this.selectedBaseParcel = null
    },
    unsetBaseDeed () {
      this.selectedBaseDeed = null
    },
    isSelectedBaseParcel (baseParcel) {
      return (
        this.selectedBaseParcel &&
        this.selectedBaseParcel.join(',') ==
          [baseParcel.x, baseParcel.y].join(',')
      )
    },
    isSelectedBaseDeed (baseDeed) {
      return (
        this.selectedBaseDeed &&
        this.selectedBaseDeed.join(',') == [baseDeed.x, baseDeed.y].join(',')
      )
    },
    goBack () {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped>
.parcel-card-link {
  text-decoration: none;
}
</style>
