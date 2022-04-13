export default {
  namespaced: true,
  state: () => ({
    fetchingScenes: true,
    userScenes: [
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
    userLandFetchStart: (state) => (state.fetchingUserScenes = true),
    userLandFetchStop: (state, errorMessage) => {
      state.fetchingUserScenes = false;
      state.userLandError = errorMessage;
    },
    sceneFetchStart: (state) => (state.fetchingParcels = true),
    sceneFetchStop: (state, errorMessage) => {
      state.fetchingParcels = false;
      state.userLandError = errorMessage;
    },
    sceneUpdateStart: (state) => (state.updatingParcel = true),
    sceneUpdateStop: (state, errorMessage) => {
      state.updatingParcel = false;
      state.updateError = errorMessage;
    },
    loadFetchedScenes: (state, parcels) => {
      state.unimportedParcels = parcels;
    },
    loadUserScenes: (state, parcels) => {
      state.userLand = parcels;
    },
  },
  actions: {
    async fetchUserScenes({ commit }) {
      commit("userLandFetchStart");
      try {
        const userScenes = await fetch(
          `${process.env.VUE_APP_API_URL}/scene/${this.state.login.account}`
        );
        const userSceneData = await userScenes.json();
        commit("loadUserScenes", userSceneData.scenes);
        commit("userLandFetchStop");
      } catch (error) {
        commit("userLandFetchStop", "Could not find scenes for user.");
      }
    },
    async updateSceneData({ commit }, sceneData) {
      console.log(sceneData);
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet: this.state.login.account,
          sceneData
        }),
      };
      if (!sceneData) {
        return;
      }
      commit("sceneUpdateStart");
      try {
        await fetch(`${process.env.VUE_APP_API_URL}/land/update`, options);
        commit("sceneUpdateStop");
      } catch (error) {
        commit("sceneUpdateStop", error);
      }
    },
  },
};
