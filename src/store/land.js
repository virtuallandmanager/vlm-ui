export default {
  namespaced: true,
  state: () => ({
    unimportedParcels: {
      parcels: [],
      aetheriaParcels: []
    },
    fetchingParcels: true,
    fetchingUserLand: false,
    userLand: [],
    sceneDefault: {
      dialogs: [{ dialogType: 0, enabled: false, messages: [] }],
      audioStream: {},
      entities: [{}],
      videoSystems: [
        {
          volume: 1,
          liveStreamEnabled: false,
          playlistEnabled: false,
          liveLink: "",
          offImage: "",
          playlist: []
        }
      ],
      imageTextures: [{}],
      moderation: {
        allowCertainWearables: false,
        banCertainWearables: false
      }
    }
  }),
  getters: {
    userLand: (state) => state.userLand,
    fetchingUserLand: (state) => state.fetchingUserLand,
    property: (state, getters) => (xCoord, yCoord) => getters.userLand && getters.userLand.find((property) => property.baseParcel == xCoord + "," + yCoord),
    lastUpdate: (state, getters) => (xCoord, yCoord) => getters.property(xCoord, yCoord).lastUpdate
  },
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
    updateUserLand: (state, updatedProperty) => {
      const storedParcelIndex = state.userLand.findIndex((property) => property.baseParcel == updatedProperty.baseParcel);
      state.userLand[storedParcelIndex] = updatedProperty;
      console.log(storedParcelIndex, state.userLand[storedParcelIndex], updatedProperty.lastUpdate);
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
      state.userLand = parcels.map((property) => {
        const scene = { ...state.sceneDefault, ...property.scene };
        return { ...property, scene };
      });
      console.log("userLand: ", state.userLand);
    }
  },
  actions: {
    async fetchUserLand({ commit }) {
      commit("userLandFetchStart");
      try {
        const userLand = await fetch(`${process.env.VUE_APP_API_URL}/land/${this.state.login.account}`);
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
        const parcels = await fetch(`${process.env.VUE_APP_API_URL}/land/owned/${this.state.login.account}`);
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
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          wallet: this.state.login.account,
          parcels
        })
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
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          wallet: this.state.login.account,
          property
        })
      };
      if (!property) {
        return;
      }
      commit("parcelUpdateStart");
      try {
        const response = await fetch(`${process.env.VUE_APP_API_URL}/land/update`, options);
        const updatedProperty = await response.json();
        commit("updateUserLand", updatedProperty);
        commit("parcelUpdateStop");
      } catch (error) {
        commit("parcelUpdateStop", error);
      }
    }
  }
};
