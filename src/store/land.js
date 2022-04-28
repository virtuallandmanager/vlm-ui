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
      imageTextures: [
        {
          clickEvent: {
            type: 0,
            externalLink: "",
            sound: "",
            moveTo: "",
            teleportTo: ""
          }
        }
      ],
      moderation: {
        allowCertainWearables: false,
        banCertainWearables: false
      }
    }
  }),
  getters: {
    unimportedParcels: (state) => state.unimportedParcels,
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
      state.userLand[storedParcelIndex] = { ...state.sceneDefault, ...updatedProperty };
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
        const sceneData = { ...state.sceneDefault, ...property.sceneData };
        return { ...property, sceneData };
      });
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
    async updateLandProperties({ commit }, options) {
      const property = options.property;
      const payload = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          wssMessages: options.wssMessages,
          wallet: this.state.login.account,
          property
        })
      };
      if (!property) {
        return;
      }
      commit("parcelUpdateStart");
      try {
        const response = await fetch(`${process.env.VUE_APP_API_URL}/land/update`, payload);
        const updatedProperty = await response.json();
        commit("updateUserLand", updatedProperty);
        commit("parcelUpdateStop");
      } catch (error) {
        commit("parcelUpdateStop", error);
      }
    }
  }
};
