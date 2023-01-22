import { SceneModeration } from "../../models/SceneModeration";

export default {
  namespaced: true,
  state: () => ({
    error: false,
    errorMessage: "",
    activeParcel: "",
    unimportedParcels: {
      parcels: [],
      aetheriaParcels: []
    },
    fetchingParcels: true,
    fetchingUserLand: false,
    userLand: [],
    sceneDefault: {
      dialogs: [
        {
          dialogType: 0,
          enabled: false,
          messages: []
        }
      ],
      audioStream: {},
      entities: [{}],
      features: {
        analytics: false,
        entityPlacement: false,
        customizations: false,
        dialogs: false,
        moderation: false
      },
      videoScreens: [],
      images: [],
      moderation: new SceneModeration(),
      customizations: []
    }
  }),
  getters: {
    unimportedParcels: (state) => state.unimportedParcels,
    userLand: (state) => state.userLand,
    fetchingUserLand: (state) => state.fetchingUserLand,
    property: (state, getters) => (xCoord, yCoord) => getters.userLand && getters.userLand.find((property) => property.baseParcel == xCoord + "," + yCoord),
    lastUpdate: (state, getters) => (xCoord, yCoord) => getters.property(xCoord, yCoord).lastUpdate,
    error: (state) => state.error,
    errorMessage: (state) => state.errorMessage
  },
  mutations: {
    clearUserLand: (state) => {
      state.userLand = [];
    },
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
      state.userLand[storedParcelIndex] = {
        ...state.sceneDefault,
        ...updatedProperty
      };
    },
    updateActiveParcel: (state, baseParcel) => {
      state.activeParcel = baseParcel;
    },
    parcelUpdateStart: (state) => (state.updatingParcel = true),
    parcelUpdateStop: (state, errorMessage) => {
      state.updatingParcel = false;
      if (errorMessage) {
        state.error = true;
        state.errorMessage = errorMessage;
      }
    },
    loadFetchedParcels: (state, parcels) => {
      state.unimportedParcels = parcels;
    },
    loadUserLand: (state, parcels) => {
      state.userLand = parcels.map((property) => {
        const sceneData = {};

        property.features = { ...state.sceneDefault.features, ...property.features }

        Object.keys(state.sceneDefault).forEach((key) => {
          if (Array.isArray(property.sceneData[key])) {
            sceneData[key] = property.sceneData[key] && property.sceneData[key].length ? property.sceneData[key] : state.sceneDefault[key];
          } else {
            sceneData[key] = { ...state.sceneDefault[key], ...property.sceneData[key] };
          }
        });

        return {
          ...property,
          sceneData
        };
      });
    },
    setErrorState: (state, errorState) => {
      state.error = errorState;
      if (!errorState) {
        state.errorMessage = "";
      }
    },
    setErrorMessage: (state, error) => {
      state.error = true;
      state.errorMessage = error;
    }
  },
  actions: {
    setErrorState({ commit }, errorState) {
      commit("setErrorState", errorState);
    },
    setErrorMessage({ commit }, error) {
      commit("setErrorMessage", error);
    },
    async fetchUserLand({ commit }) {
      commit("clearUserLand");
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
    updateActiveParcel({ commit }, baseParcel) {
      commit("updateActiveParcel", baseParcel);
    },
    async updateLandProperties({ commit, getters }, options) {
      const property = options.property,
        coords = options.property.baseParcel.split(","),
        xCoord = coords[0],
        yCoord = coords[1];
      const payload = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          wssMessages: options.wssMessages,
          wallet: this.state.login.account,
          lastUpdate: getters.lastUpdate(xCoord, yCoord),
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
        if (response.status !== 200) {
          commit("parcelUpdateStop", updatedProperty.text);
        } else {
          commit("updateUserLand", updatedProperty);
          commit("parcelUpdateStop");
        }
      } catch (error) {
        commit("parcelUpdateStop", error);
      }
    },
    // connectWebSocket
  }
};
