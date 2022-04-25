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
      <loader
        message="Checking your wallet for virtual land..."
        :loading="loading"
        :grid="true"
      />
      <div v-for="parcelType in parcelTypes" :key="parcelType.id">
        <v-row class="text-center" v-if="!loading && parcelType.parcels.length">
          <v-col>
            <v-card class="pa-6 fill-height">
              <div class="text-h6">{{ parcelType.name }} Parcels</div>
              <v-container>
                <v-row>
                  <v-col
                    cols="4"
                    v-for="(parcel, i) in parcelType.parcels"
                    :key="i"
                    class="d-inline"
                  >
                    <v-checkbox
                      v-model="parcelType.selectedParcels[i]"
                      :label="convertCoords(parcel)"
                      class="d-inline mx-auto"
                      @change="
                        groupAdjacentParcels(
                          parcelType.parcels,
                          parcelType.selectedParcels,
                          parcelType.id
                        )
                      "
                    ></v-checkbox>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col v-if="parcelType.adjacentParcelsPresent">
                    <v-switch
                      v-model="parcelType.group"
                      label="Group Adjacent Parcels"
                    ></v-switch>
                    <div v-for="(group, i) in parcelType.adjacentParcels" :key="i">
                      <v-select
                        :items="group"
                        :label="`Base Parcel for Group ${i}`"
                      ></v-select>
                    </div>
                  </v-col>
                </v-row>
              </v-container>
            </v-card>
          </v-col>
        </v-row>
        <v-row class="text-center" v-if="!loading && parcelType.parcels.length">
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
      </div>
    </v-container>
  </v-sheet>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import * as parcelHelper from '../helpers/parcelHelper'
import Loader from '../components/Loader'

export default {
  name: 'ImportLand',
  data: () => ({
    parcelTypes: {
      DCL: {
        id: 0,
        name: 'Decentraland Land',
        parcels: [],
        selectedParcels: [false],
        group: false,
        adjacentParcelsPresent: false
      },
      DEED: {
        id: 1,
        name: 'Aetheria Deed',
        parcels: [],
        selectedParcels: [false],
        group: false,
        adjacentParcelsPresent: false
      }
    }
  }),
  components: {
    Loader
  },
  async mounted () {
    console.log('mounted')
    await this.fetchUnimportedParcels()
    this.parcelTypes.DCL.parcels = this.unimportedParcels.parcels
    this.parcelTypes.DEED.parcels = this.unimportedParcels.aetheriaDeeds
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
    createRows (parcels) {
      console.log(parcels)
      const selectedParcels = parcels.filter((x, i) => this.selectedDeeds[i])
      return parcelHelper.getRowsAndCols(selectedParcels)
    },
    groupAdjacentParcels (allParcels, selectedParcels, parcelType) {
      const selections = allParcels.filter((x, i) => selectedParcels[i])

      const adjacent = parcelHelper.groupAdjacentParcels(selections)
      console.log(adjacent)
      if (parcelType == this.parcelTypes.DCL.id) {
        this.parcelTypes.DCL.adjacentParcels = adjacent
        this.parcelTypes.DCL.adjacentParcelsPresent = adjacent.some(
          group => group.length > 1
        )
      } else if (parcelType == this.parcelTypes.DEED.id) {
        this.parcelTypes.DEED.adjacentDeeds = adjacent
        this.parcelTypes.DEED.adjacentParcelsPresent = adjacent.some(
          group => group.length > 1
        )
      }
      return adjacent
    },
    convertCoords (parcel) {
      return `${parcel.x},${parcel.y}`
    },
    async processAndImportParcels () {
      const parcelsToImport = this.unimportedParcels.parcels.filter(
        (parcel, i) => this.parcelTypes.DCL.selectedParcels[i]
      )
      const deedsToImport = this.unimportedParcels.aetheriaDeeds.filter(
        (parcel, i) => this.parcelTypes.DEED.selectedParcels[i]
      )
      console.log(parcelsToImport, deedsToImport)
      await this.importParcels([...parcelsToImport, ...deedsToImport])
      return this.goBack()
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
        this.selectedBaseParcel == [baseParcel.x, baseParcel.y].join(',')
      )
    },
    isSelectedBaseDeed (baseDeed) {
      return (
        this.selectedBaseDeed &&
        this.selectedBaseDeed == [baseDeed.x, baseDeed.y].join(',')
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
