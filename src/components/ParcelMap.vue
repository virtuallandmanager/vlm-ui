<template>
  <v-card
    :elevation="hideWrapper ? 0 : 2"
    :class="wrapperClass"
  >
    <h5 v-if="!hideWrapper" :class="hClass">Parcel Map</h5>
    <div
      class="mx-auto"
      id="parcelMap"
      :style="
        'height:' +
          (propertyRows * 20 + 2) +
          'px; width:' +
          (propertyCols * 20 + 2) +
          'px'
      "
    >
      <div v-for="(parcel, i) in mappedParcels" :key="i">
        <div
          :class="parcel.baseParcel ? 'base-parcel' : 'parcel'"
          v-bind:key="parcel.x + '-' + parcel.y"
          :style="'left: ' + parcel.x + 'px; bottom: ' + parcel.y + 'px'"
        ></div>
      </div>
    </div>
  </v-card>
</template>

<script>
import * as parcelHelper from '../helpers/parcelHelper.js'
export default {
  name: 'ParcelMap',
  data: () => ({}),
  props: {
    property: {
      baseParcel: String,
      parcels: Array
    },
    hideWrapper: { type: Boolean, default: false },
    wrapperClass: { type: String, default: '' },
    hClass: { type: String, default: '' }
  },
  computed: {
    mappedParcels () {
      return this.computeParcels()
    },
    sortedCoords () {
      const coords = this.property.parcels.map(parcel => [parcel.x, parcel.y])
      return coords.sort((a, b) => {
        if (a[0] == b[0]) {
          return a[1] - b[1]
        }
        return a[0] - b[0]
      })
    },
    xCoords () {
      return parcelHelper.xCoords(this.property.parcels)
    },
    yCoords () {
      return parcelHelper.yCoords(this.property.parcels)
    },
    propertyRows () {
      return parcelHelper.propertyRows(this.yCoords)
    },
    propertyCols () {
      return parcelHelper.propertyCols(this.xCoords)
    }
  },
  methods: {
    computeParcels () {
      const baseParcel = this.property.baseParcel.split(',')
      const mappedParcels = this.sortedCoords.map(coord => {
        const xOffset = (coord[0] - parcelHelper.lowestX(this.xCoords)) * 20
        const yOffset = (coord[1] - parcelHelper.lowestY(this.yCoords)) * 20

        const parcel = {
          coords: coord,
          baseParcel: false,
          x: xOffset,
          y: yOffset
        }

        if (coord[0] == baseParcel[0] && coord[1] == baseParcel[1]) {
          console.log(
            this.property.name +
              "'s base parcel is " +
              baseParcel[0] +
              ', ' +
              baseParcel[1]
          )
          parcel.baseParcel = true
        }

        return parcel
      })

      return mappedParcels
    }
  }
}
</script>

<style scoped>
#parcelMap {
  position: relative;
}

.parcel,
.base-parcel {
  position: absolute;
  display: inline-block;
  height: 22px;
  width: 22px;
  background-color: gray;
  border: 2px solid black;
  box-sizing: border-box;
}

.base-parcel {
  background-color: cornflowerblue;
}
</style>
