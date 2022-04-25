<template>
  <v-card
    class="text-center"
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
      <template v-for="parcel in mappedParcels">
        <div
          :class="parcel.baseParcel ? 'base-parcel' : 'parcel'"
          v-bind:key="parcel.x + '-' + parcel.y"
          :style="'left: ' + parcel.x + 'px; top: ' + parcel.y + 'px'"
        ></div>
      </template>
    </div>
  </v-card>
</template>

<script>
export default {
  name: "ParcelMap",
  data: () => ({}),
  props: {
    property: {
      baseParcel: String,
      parcels: Array,
    },
    hideWrapper: { type: Boolean, default: false },
    wrapperClass: { type: String, default: "" },
    hClass: { type: String, default: "" },
  },
  computed: {
    mappedParcels() {
      return this.computeParcels();
    },
    sortedCoords() {
      const coords = this.property.parcels;
      return coords.sort((a, b) => {
        if (a[0] == b[0]) {
          return a[1] - b[1];
        }
        return a[0] - b[0];
      });
    },
    xCoords() {
      const coords = this.property.parcels;
      return coords.map((coord) => coord[0]);
    },
    yCoords() {
      const coords = this.property.parcels;
      return coords.map((coord) => coord[1]);
    },
    lowestX() {
      const xCoords = this.xCoords;
      return xCoords.sort((a, b) => a - b)[0];
    },
    lowestY() {
      const yCoords = this.yCoords;
      return yCoords.sort((a, b) => a - b)[0];
    },
    highestX() {
      const xCoords = this.xCoords;
      const highestX = xCoords.sort((a, b) => b - a)[0] - 0;
      return highestX;
    },
    highestY() {
      const yCoords = this.yCoords;
      const highestY = yCoords.sort((a, b) => b - a)[0] - 0;
      return highestY;
    },
    propertyRows() {
      //   console.log("highestY: ", this.highestY, " lowestY: ", this.lowestY);
      //   console.log("propertyRows: " + (1 + this.highestY - this.lowestY));
      console.log("propertyRows: ", 1 + this.highestY - this.lowestY);
      return 1 + this.highestY - this.lowestY;
    },
    propertyCols() {
      //   console.log("highestX: ", this.highestX, " lowestX: ", this.lowestX);
      //   console.log("propertyCols: " + (1 + this.highestX - this.lowestX));
      return 1 + this.highestX - this.lowestX;
    },
  },
  methods: {
    computeParcels() {
      const baseParcel = this.property.baseParcel.split(',');
      //   console.log(this.property.name);
      const mappedParcels = this.sortedCoords.map((coord) => {
        // console.log(this.property.name + " coord: ", coord);
        const xOffset = (coord[0] - this.lowestX) * 20;
        const yOffset = (coord[1] - this.lowestY) * 20;

        const parcel = {
          coords: coord,
          baseParcel: false,
          x: xOffset,
          y: yOffset,
        };

        // console.log(coord[0], baseParcel[0], coord[0] == baseParcel[0], coord[1] == baseParcel[1]);

        if (coord[0] == baseParcel[0] && coord[1] == baseParcel[1]) {
          console.log(
            this.property.name +
              "'s base parcel is " +
              baseParcel[0] +
              ", " +
              baseParcel[1]
          );
          parcel.baseParcel = true;
        }

        return parcel;
      });

      return mappedParcels;
    },
  },
};
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
