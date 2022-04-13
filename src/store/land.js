export default {
  namespaced: true,
  state: () => ({
    unimportedParcels: {
      parcels: [],
      aetheriaParcels: [],
    },
    fetchingParcels: true,
    userLand: [
      //   {
      //     name: "The Edge",
      //     baseParcel: [100, 154],
      //     parcels: [[100, 154]],
      //     settings: {
      //       banCertainWearables: false,
      //       banBugs: false,
      //       banRoaches: false,
      //       banFlies: false,
      //       banOtherWearables: false,
      //       allowCertainWearables: false,
      //       wearableWhiteList: [{ contractId: "", tokenId: "" }],
      //       otherWearablesToBan: [{ contractId: "", tokenId: "" }]
      //     }
      //   },
      //   {
      //     name: "casa Roustan",
      //     baseParcel: [37, -114],
      //     parcels: [[37, -114]],
      //     settings: {
      //       banCertainWearables: false,
      //       banBugs: false,
      //       banRoaches: false,
      //       banFlies: false,
      //       banOtherWearables: false,
      //       allowCertainWearables: false,
      //       wearableWhiteList: [{ contractId: "", tokenId: "" }],
      //       otherWearablesToBan: [{ contractId: "", tokenId: "" }]
      //     }
      //   },
      //   {
      //     name: "Livication Virtual",
      //     baseParcel: [123, 77],
      //     parcels: [
      //       [123, 77],
      //       [124, 77]
      //     ],
      //     settings: {
      //       banCertainWearables: false,
      //       banBugs: false,
      //       banRoaches: false,
      //       banFlies: false,
      //       banOtherWearables: false,
      //       allowCertainWearables: false,
      //       wearableWhiteList: [{ contractId: "", tokenId: "" }],
      //       otherWearablesToBan: [{ contractId: "", tokenId: "" }]
      //     }
      //   }
    ],
  }),
  mutations: {
    userLandFetchStart: (state) => (state.fetchingUserLand = true),
    userLandFetchStop: (state, errorMessage) => {
      state.fetchingUserLand = false;
      state.userLandError = errorMessage;
    },
    parcelFetchStart: (state) => (state.fetchingParcels = true),
    parcelFetchStop: (state, errorMessage) => {
      state.fetchingParcels = false;
      state.userLandError = errorMessage;
    },
    parcelImportStart: (state) => (state.importingParcels = true),
    parcelImportStop: (state, errorMessage) => {
      state.importingParcels = false;
      state.parcelsError = errorMessage;
    },
    parcelUpdateStart: (state) => (state.updatingParcel = true),
    parcelUpdateStop: (state, errorMessage) => {
      state.updatingParcel = false;
      state.updateError = errorMessage;
    },
    loadFetchedParcels: (state, parcels) => {
      state.unimportedParcels = parcels;
    },
    loadUserLand: (state, parcels) => {
      state.userLand = parcels;
    },
  },
  actions: {
    async fetchUserLand({ commit }) {
      commit("userLandFetchStart");
      try {
        const userLand = await fetch(
          `${process.env.VUE_APP_API_URL}/land/${this.state.login.account}`
        );
        const userLandData = await userLand.json();
        commit("loadUserLand", userLandData.sceneData);
        commit("userLandFetchStop");
      } catch (error) {
        commit("userLandFetchStop", "Could not find user land.");
      }
    },
    async fetchUnimportedParcels({ commit }) {
      commit("parcelFetchStart");
      try {
        const parcels = await fetch(
          `${process.env.VUE_APP_API_URL}/land/owned/${this.state.login.account}`
        );
        const parcelData = await parcels.json();
        console.log("parcelData: ", parcelData);
        commit("loadFetchedParcels", parcelData);
        commit("parcelFetchStop");
      } catch (error) {
        commit("parcelFetchStop", error);
      }
    },
    async importParcels({ commit }, parcels) {
      console.log(parcels);
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet: this.state.login.account,
          parcels,
        }),
      };
      if (!parcels) {
        return;
      }
      commit("parcelImportStart");
      try {
        await fetch(`${process.env.VUE_APP_API_URL}/land/import`, options);
        commit("parcelImportStop");
      } catch (error) {
        commit("parcelImportStop", error);
      }
    },
    async updateLandProperties({ commit }, property) {
      console.log(property);
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet: this.state.login.account,
          property
        }),
      };
      if (!property) {
        return;
      }
      commit("parcelUpdateStart");
      try {
        await fetch(`${process.env.VUE_APP_API_URL}/land/update`, options);
        commit("parcelUpdateStop");
      } catch (error) {
        commit("parcelUpdateStop", error);
      }
    },
  },
};
