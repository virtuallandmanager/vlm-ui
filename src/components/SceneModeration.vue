<template>
  <v-container class="py-6 mx-auto">
    <v-row>
      <v-col no-gutters>
        <h1 class="text-h5 ml-2 mb-4">Moderation</h1>
      </v-col>
    </v-row>
    <v-row class="grey darken-3 mx-n3">
      <v-col no-gutters>
        <h1 class="text-h6 white--text">Wearables</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-switch
          v-model="settings.banCertainWearables"
          @change="toggleBannedWearables()"
          label="Ban Certain Wearables"
        ></v-switch>
      </v-col>
    </v-row>
    <v-row v-if="settings.banCertainWearables" class="blue-grey lighten-5">
      <v-col>
        <v-switch
          v-model="settings.banRoaches"
          @change="updateProperties()"
          label="Ban Roaches"
          class="ml-4"
        ></v-switch>
        <v-switch
          v-model="settings.banFlies"
          @change="updateProperties()"
          label="Ban Flies"
          class="ml-4"
        ></v-switch>
        <v-switch
          v-if="settings.banCertainWearables"
          @change="updateProperties()"
          v-model="settings.banWeapons"
          label="Ban Weapons"
          class="ml-4"
        >
        </v-switch>
        <v-switch
          v-model="settings.banOtherWearables"
          @change="updateProperties()"
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
                <v-icon>mdi-trash-can</v-icon>
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
          @change="toggleWhitelistedWearables()"
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
              <v-icon>mdi-trash-can</v-icon>
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
</template>

<script>
export default {
  name: "SceneModeration",

  data: () => ({
    defaultModerationSettings: {
      banCertainWearables: false,
      banBugs: false,
      banRoaches: false,
      banFlies: false,
      banOtherWearables: false,
      allowCertainWearables: false,
      wearableWhiteList: [{ contractId: "", tokenId: "" }],
      otherWearablesToBan: [{ contractId: "", tokenId: "" }],
    },
  }),
  props: {
    settings: {
      type: Object,
    },
  },
  mounted() {
    for (const [key, value] of Object.entries(this.defaultModerationSettings)) {
      if (typeof this.settings[key] == "undefined") {
        this.settings[key] = value;
      }
    }
  },
  computed: {},
  methods: {
    toggleBannedWearables() {
      if (this.settings.allowCertainWearables) {
        this.settings.allowCertainWearables = false;
      }
      this.updateProperties();
    },
    toggleWhitelistedWearables() {
      if (this.settings.banCertainWearables) {
        this.settings.banCertainWearables = false;
      }
      this.updateProperties();
    },
    addBannedItem() {
      const nextItem = { contractId: "", tokenId: "" };
      this.settings.otherWearablesToBan.push(nextItem);
      this.updateProperties();
    },
    removeBannedItem(i) {
      if (this.settings.otherWearablesToBan.length < 2) {
        this.settings.banOtherWearables = false;
        this.settings.otherWearablesToBan = [{ contractId: "", tokenId: "" }];
      }
      this.settings.otherWearablesToBan.splice(i, 1);
      this.updateProperties();
    },
    addWhitelistItem() {
      const nextItem = { contractId: "", tokenId: "" };
      this.settings.wearableWhiteList.push(nextItem);
      this.updateProperties();
    },
    removeWhitelistItem(i) {
      if (this.settings.wearableWhiteList.length < 2) {
        this.settings.allowCertainWearables = false;
        this.settings.wearableWhiteList = [{ contractId: "", tokenId: "" }];
      }
      this.settings.wearableWhiteList.splice(i, 1);
      this.updateProperties();
    },
    updateProperties() {
      this.$emit("updateProperties");
    },
  },
};
</script>
