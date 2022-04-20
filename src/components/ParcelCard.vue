<template>
  <v-sheet class="pa-2 grey lighten-4" elevation="2">
    <parcel-map
      :property="property"
      :hideWrapper="true"
      class="float-right ma-2"
    />
    <div class="text-h6 font-weight-light text-left">
      {{ property.propertyName || "Unnamed Parcel" }}
    </div>
    <div class="text-subtitle-2 font-weight-medium text-left">
      {{ property.baseParcel }}
    </div>
    <div class="text-subtitle-2 font-weight-light text-left">
      {{ property.parcels.length }} Parcel{{
        property.parcels.length > 1 ? "s" : ""
      }}
    </div>
  </v-sheet>
</template>

<script>
import ParcelMap from "./ParcelMap";
export default {
  components: { ParcelMap },

  name: "ParcelCard",

  data: () => ({}),
  props: {
    property: {
      propertyName: String,
      baseParcel: String,
      parcels: Array,
      settings: {
        allowCertainWearables: Boolean,
        banCertainWearables: Boolean,
        banBugs: Boolean,
        banRoaches: Boolean,
        banFlies: Boolean,
        banOtherWearables: Boolean,
        wearableWhiteList: Array,
        otherWearablesToBan: Array,
      },
    },
  },
};
</script>
