<template>
  <v-sheet elevation="2" max-width="960" class="mx-auto" height="100%">
    <v-container class="pa-6" v-if="property">
      <v-row>
        <v-col>
          <v-btn @click="goBack">Back</v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            v-if="editingName"
            v-model="property.propertyName"
            class="parcel-name-input"
            @blur="updateProperties()"
            autofocus
            append-icon="mdi-pencil"
          ></v-text-field>
          <v-hover
            v-slot="{ hover }"
            :value="editingName"
            open-delay="200"
            close-delay="200"
          >
            <h1 v-if="!editingName" @click="editName()">
              {{ property.propertyName }}
              <v-btn
                :class="!editingName && hover ? 'visible' : 'hidden'"
                icon
                color="black"
                fab
                x-small
                class="mb-1"
                @click="editName()"
                ><v-icon>mdi-pencil</v-icon></v-btn
              >
            </h1>
          </v-hover>
          <h5>
            {{ property.parcels.length }} Parcel{{
              property.parcels.length > 1 ? "s" : ""
            }}:
          </h5>
          <h6>
            <span
              v-for="coord in property.parcels"
              v-bind:key="coord[0] + '-' + coord[1]"
              ><nobr>{{ coord }}</nobr
              >{{
                coord == property.parcels[property.parcels.length - 1]
                  ? ""
                  : ", "
              }}</span
            >
          </h6>
        </v-col>
        <div>
          <parcel-map :property="property" wrapperClass="pa-4" hClass="pb-4" />
        </div>
      </v-row>
      <v-row>
        <v-col>
          <v-switch
            v-model="settings.banCertainWearables"
            @change="settings.allowCertainWearables = false"
            label="Ban Certain Wearables"
          ></v-switch>
        </v-col>
      </v-row>
      <v-row v-if="settings.banCertainWearables" class="blue-grey lighten-5">
        <v-col>
          <v-switch
            v-model="settings.banRoaches"
            label="Ban Roaches"
            class="ml-4"
          ></v-switch>
          <v-switch
            v-model="settings.banFlies"
            label="Ban Flies"
            class="ml-4"
          ></v-switch>
          <v-switch
            v-if="settings.banCertainWearables"
            v-model="settings.banWeapons"
            label="Ban Weapons"
            class="ml-4"
          >
          </v-switch>
          <v-switch
            v-model="settings.banOtherWearables"
            label="Ban Other Wearables"
            class="ml-4"
          ></v-switch>
          <div v-if="settings.banOtherWearables">
            <v-row
              v-for="(item, i) in settings.otherWearablesToBan"
              :key="i"
              dense
            >
              <v-col cols="7" md="8" sm="9" xs="4">
                <v-text-field
                  label="Contract ID"
                  dense
                  v-model="item.contractId"
                  hide-details="auto"
                ></v-text-field>
              </v-col>
              <v-col cols="4" md="3" sm="2" xs="6">
                <v-text-field
                  label="Token ID"
                  dense
                  v-model="item.tokenId"
                  hide-details="auto"
                ></v-text-field>
              </v-col>
              <v-spacer></v-spacer>
              <v-col cols="1" sm="1" xs="2" class="text-right">
                <v-btn icon color="gray" @click="removeBannedItem(i)">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-btn @click="addBannedItem()">Add Item</v-btn>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-switch
            v-model="settings.allowCertainWearables"
            @change="settings.banCertainWearables = false"
            label="Only Allow Certain Wearables"
          ></v-switch>
        </v-col>
      </v-row>
      <v-row v-if="settings.allowCertainWearables" class="blue-grey lighten-5">
        <v-col>
          <v-row v-for="(item, i) in settings.wearableWhiteList" :key="i" dense>
            <v-col cols="7" md="8" sm="9" xs="4">
              <v-text-field
                label="Contract ID"
                dense
                v-model="item.contractId"
                hide-details="auto"
              ></v-text-field>
            </v-col>
            <v-col cols="4" md="3" sm="2" xs="6">
              <v-text-field
                label="Token ID"
                dense
                v-model="item.tokenId"
                hide-details="auto"
              ></v-text-field>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="1" sm="1" xs="2" class="text-right">
              <v-btn icon color="gray" @click="removeWhitelistItem(i)">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-btn @click="addWhitelistItem()">Add Item</v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
</template>

<script>
import ParcelMap from "../components/ParcelMap";
import { mapState, mapActions } from "vuex";

export default {
  name: "Parcel",
  components: {
    ParcelMap,
  },
  data: () => ({
    editingName: false,
  }),
  created() {
    this.$watch(
      () => this.$route.params,
      (toParams, previousParams) => {
        console.log(this.$route.params, toParams, previousParams);
        // react to route changes...
      }
    );
  },
  mounted() {
    if (!this.userLand.length) {
      this.fetchUserLand();
    }
  },
  computed: {
    ...mapState({
      userLand: (state) => state.land.userLand,
    }),
    property() {
      const xCoord = this.$route.params.xCoord,
        yCoord = this.$route.params.yCoord;
      console.log(xCoord, yCoord);
      console.log(this.userLand);
      // console.log(this.userLand.find((property) => property.baseParcel.join(" ") == xCoord + " " + yCoord));
      return this.userLand.find(
        (property) => property.baseParcel.join(" ") == xCoord + " " + yCoord
      );
    },
    settings() {
      return this.property.settings;
    },
  },
  methods: {
    ...mapActions({
      fetchUserLand: "land/fetchUserLand",
      updateLandProperties: "land/updateLandProperties",
    }),
    addBannedItem() {
      const nextItem = { contractId: "", tokenId: "" };
      return this.settings.otherWearablesToBan.push(nextItem);
    },
    removeBannedItem(i) {
      if (this.settings.otherWearablesToBan.length < 2) {
        this.settings.banOtherWearables = false;
        this.settings.otherWearablesToBan = [{ contractId: "", tokenId: "" }];
        return;
      }
      this.settings.otherWearablesToBan.splice(i, 1);
    },
    addWhitelistItem() {
      const nextItem = { contractId: "", tokenId: "" };
      return this.settings.wearableWhiteList.push(nextItem);
    },
    removeWhitelistItem(i) {
      if (this.settings.wearableWhiteList.length < 2) {
        this.settings.allowCertainWearables = false;
        this.settings.wearableWhiteList = [{ contractId: "", tokenId: "" }];
        return;
      }
      this.settings.wearableWhiteList.splice(i, 1);
    },
    editName() {
      this.editingName = true;
    },
    updateProperties(e) {
      this.updateLandProperties({
        propertyName: this.property.propertyName,
        sceneData: this.property.sceneData,
        tokenId: this.property.tokenId
      });
      console.log(e);
      this.editingName = false;
    },
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style lang="scss" scoped>
.parcel-name-input {
  font-size: 2em;
  font-weight: bold;
  height: 2em;
  width: 60%;
  max-width: 580px;
}
.visible {
  opacity: 1;
}
.hidden {
  opacity: 0;
}
</style>
