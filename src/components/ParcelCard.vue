<template>
  <v-sheet class="grey darken-3 pa-2" elevation="2">
    <v-container>
      <v-row>
        <v-col>
          <div class="text-h6 font-weight-light text-left">
            {{ property.propertyName || 'Unnamed Parcel' }}
          </div>
          <div class="text-subtitle-2 font-weight-medium text-left">
            {{ property.baseParcel }}
          </div>
          <div class="text-subtitle-2 font-weight-light text-left">
            {{ property.parcels.length }} Parcel{{
              property.parcels.length > 1 ? 's' : ''
            }}
          </div>
        </v-col>
        <v-col class="text-right">
          <div class="d-inline-block">
            <parcel-map
              :property="property"
              :hideWrapper="true"
              class="ma-2 transparent"
              wrapperClass="text-right"
            />
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
</template>

<script>
import ParcelMap from './ParcelMap'
export default {
  components: { ParcelMap },

  name: 'ParcelCard',

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
        otherWearablesToBan: Array
      }
    }
  }
}
</script>
