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
                      @change="enableGrouping"
                      label="Group Adjacent Parcels"
                    ></v-switch>
                    <div v-if="parcelType.group">
                      <div
                        v-for="(group, i) in parcelType.adjacentParcels"
                        :key="i"
                      >
                        <v-select
                          v-model="parcelType.selectedBaseParcels[i]"
                          :items="group"
                          @change="setBaseParcelErrors(i)"
                          :error-messages="
                            parcelType.selectedBaseParcelErrors[i]
                          "
                          :label="`Base Parcel for Group ${i + 1}`"
                        ></v-select>
                      </div>
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
        selectedBaseParcels: [],
        selectedBaseParcelErrors: [],
        group: false,
        adjacentParcelsPresent: false,
        adjacentParcels: []
      },
      DEED: {
        id: 1,
        name: 'Aetheria Deed',
        parcels: [],
        selectedParcels: [false],
        selectedBaseParcels: [],
        selectedBaseParcelErrors: [],
        group: false,
        adjacentParcelsPresent: false,
        adjacentParcels: []
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
      if (adjacent[0].length <= 1) {
        return
      }
      if (parcelType == this.parcelTypes.DCL.id) {
        this.parcelTypes.DCL.adjacentParcels = adjacent
        this.parcelTypes.DCL.adjacentParcelsPresent = adjacent.some(
          group => group.length > 1
        )
      } else if (parcelType == this.parcelTypes.DEED.id) {
        this.parcelTypes.DEED.adjacentParcels = adjacent
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
      let parcelsToImport = this.parcelTypes.DCL.parcels.filter(
        (parcel, i) => this.parcelTypes.DCL.selectedParcels[i]
      )
      let deedsToImport = this.parcelTypes.DEED.parcels.filter(
        (parcel, i) => this.parcelTypes.DEED.selectedParcels[i]
      )

      let hasError = false

      if (
        this.parcelTypes.DCL.adjacentParcelsPresent &&
        this.parcelTypes.DCL.group
      ) {
        this.parcelTypes.DCL.adjacentParcels.forEach((adjacentParcel, i) => {
          const selectedBaseParcel = this.parcelTypes.DCL.selectedBaseParcels[i]
          if (selectedBaseParcel) {
            this.parcelTypes.DCL.selectedBaseParcelErrors[i] = ''
          } else {
            this.parcelTypes.DCL.selectedBaseParcelErrors[i] =
              'Select a base parcel for this group'
            this.$forceUpdate()
            hasError = true
          }
        })
      }
      if (
        this.parcelTypes.DEED.adjacentParcelsPresent &&
        this.parcelTypes.DEED.group
      ) {
        this.parcelTypes.DEED.adjacentParcels.forEach((adjacentParcel, i) => {
          const selectedBaseParcel = this.parcelTypes.DEED.selectedBaseParcels[
            i
          ]
          if (selectedBaseParcel) {
            this.parcelTypes.DEED.selectedBaseParcelErrors[i] = ''
          } else {
            this.parcelTypes.DEED.selectedBaseParcelErrors[i] =
              'Select a base parcel for this group'
            this.$forceUpdate()
            hasError = true
          }
        })
      }
      if (hasError) {
        return
      }

      parcelsToImport = this.mapBaseParcelWithXY(
        parcelsToImport,
        this.parcelTypes.DCL
      )
      deedsToImport = this.mapBaseParcelWithXY(
        deedsToImport,
        this.parcelTypes.DEED
      )

      console.log(parcelsToImport, deedsToImport)
      await this.importParcels([...parcelsToImport, ...deedsToImport])
      this.goBack()
    },
    mapBaseParcelWithXY (parcelsToImport, parcelType) {
      return parcelsToImport.map(parcel => {
        const parcelStr = `${parcel.x},${parcel.y}`,
          adjacentParcelGroup = parcelType.adjacentParcels.findIndex(group =>
            group.includes(parcelStr)
          ),
          baseParcel =
            adjacentParcelGroup >= 0
              ? parcelType.selectedBaseParcels[adjacentParcelGroup]
              : parcelStr,
          x = parcel.x,
          y = parcel.y,
          tokenId = parcel.tokenId
        return { tokenId, baseParcel, x, y }
      })
    },
    enableGrouping () {
      this.parcelTypes.DCL.adjacentParcels.forEach((group, i) => {
        this.parcelTypes.DCL.selectedBaseParcelErrors[i] = ''
      })
      this.parcelTypes.DEED.adjacentParcels.forEach((group, i) => {
        this.parcelTypes.DEED.selectedBaseParcelErrors[i] = ''
      })
    },
    setBaseParcelErrors (i) {
      this.parcelTypes.DCL.selectedBaseParcelErrors[i] = ''
      this.parcelTypes.DEED.selectedBaseParcelErrors[i] = ''
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
