import giveawayDal from "../dal/giveaway";
import store from "../../store/index";

export default {
  namespaced: true,
  state: () => ({
    activeGiveaway: null,
    userGiveawayCache: {},
    adminGiveawayCache: {},
    loadingGiveaways: false,
  }),
  getters: {
    activeEvent: (state) => state.activeEvent,
    activeGiveaway: (state) => state.activeGiveaway,
    loadingGiveaways: (state) => state.loadingGiveaways,
    giveawayList: (state) => {
      return Object.values(state.userGiveawayCache);
    },
    giveawayListSelect: (state) => {
      return Object.values(state.userGiveawayCache).map((giveaway) => ({ text: giveaway.name, value: giveaway.sk }));
    },
    allocatedAirdropCredits: (state) => {
      return Object.values(state.userGiveawayCache).reduce((acc, giveaway) => {
        return acc + giveaway?.allocatedCredits || 0;
      }, 0);
    }
  },
  mutations: {
    LOAD_GIVEAWAYS_START(state) {
      state.loadingGiveaways = true;
    },
    LOAD_GIVEAWAYS_STOP(state) {
      state.loadingGiveaways = false;
    },
    STORE_GIVEAWAY(state, giveaway) {
      if (giveaway?.userId && giveaway?.userId !== store.state.user.userInfo.sk) {
        state.adminGiveawayCache = { ...state.adminGiveawayCache, [giveaway.sk]: giveaway };
      }
      if (giveaway?.sk) {
        state.userGiveawayCache = { ...state.userGiveawayCache, [giveaway.sk]: giveaway };
      }
    },
    STORE_GIVEAWAYS(state, giveaways) {
      giveaways.forEach((giveaway) => {
        if (giveaway?.userId && giveaway?.userId !== store.state.user.userInfo.sk) {
          state.adminGiveawayCache = { ...state.adminGiveawayCache, [giveaway.sk]: giveaway };
        }
        state.userGiveawayCache = { ...state.userGiveawayCache, [giveaway.sk]: giveaway };
      });
    },
    STORE_MINTING_RIGHTS(state, { grantedRights, missingRights }) {
      // find a giveaway that has an item with a contract address that matches a key of grantedRights or mintedRights
      // if found, set the minterRightsGranted flag to true
      // if not found, set the minterRightsGranted flag to false
      const userGiveawayCache = { ...state.userGiveawayCache };
      const adminGiveawayCache = { ...state.adminGiveawayCache };
      Object.values(userGiveawayCache).forEach((giveaway) => {
        const items = giveaway?.items || [];
        items.forEach((item) => {
          if (grantedRights[item.contractAddress]?.includes(item.itemId)) {
            item.minterRights = true;
          } else if (missingRights[item.contractAddress]?.includes(item.itemId)) {
            item.minterRights = false;
          }
        });
      });
      Object.values(adminGiveawayCache).forEach((giveaway) => {
        const items = giveaway?.items || [];
        items.forEach((item) => {
          if (grantedRights[item.contractAddress]?.includes(item.itemId)) {
            item.minterRights = true;
          } else if (missingRights[item.contractAddress]?.includes(item.itemId)) {
            item.minterRights = false;
          }
        });
      });
      state.userGiveawayCache = userGiveawayCache;
      state.adminGiveawayCache = adminGiveawayCache;
    },
    SET_ACTIVE_GIVEAWAY(state, giveawayId) {
      if (giveawayId) {
        state.activeGiveaway = state.userGiveawayCache[giveawayId] || state.adminGiveawayCache[state.activeEvent.sk];
      } else if (!giveawayId && state.activeGiveaway) {
        state.activeGiveaway = state.userGiveawayCache[state.activeGiveaway.sk] || state.adminGiveawayCache[state.activeEvent.sk];
      }
    },
    CLEAR_ACTIVE_GIVEAWAY(state) {
      state.activeGiveaway = null;
    },
  },
  actions: {
    setActiveGiveaway: async ({ commit }, giveawayId) => {
      commit("SET_ACTIVE_GIVEAWAY", giveawayId);
    },
    clearActiveGiveaway: async ({ commit }) => {
      commit("CLEAR_ACTIVE_GIVEAWAY");
    },
    getGiveaway: async ({ commit }, eventId, setActive = true) => {
      commit("LOAD_GIVEAWAYS_START");
      const { giveaway } = await giveawayDal.get(eventId);
      commit("STORE_GIVEAWAY", giveaway);
      if (setActive) {
        commit("SET_ACTIVE_GIVEAWAY", giveaway.sk);
      }
      commit("LOAD_GIVEAWAYS_STOP");
    },
    getGiveaways: async ({ commit, dispatch }) => {
      commit("LOAD_GIVEAWAYS_START");
      const { giveaways } = await giveawayDal.getAll();
      const giveawayIds = giveaways.map((giveaway) => giveaway.sk);
      if (giveawayIds.length) {
        await dispatch("checkMintingRights", { giveawayIds });
        commit("STORE_GIVEAWAYS", giveaways);
      }
      commit("LOAD_GIVEAWAYS_STOP");
    },
    createGiveaway: async ({ commit }) => {
      commit("LOAD_GIVEAWAYS_START");
      const { giveaway } = await giveawayDal.create();
      commit("STORE_GIVEAWAY", giveaway);
      commit("LOAD_GIVEAWAYS_STOP");
    },
    updateGiveaway: async ({ commit }, giveawayConfig) => {
      commit("LOAD_GIVEAWAYS_START");
      const { giveaway } = await giveawayDal.update(giveawayConfig);
      commit("STORE_GIVEAWAY", giveaway);
      commit("LOAD_GIVEAWAYS_STOP");
    },
    addItemToGiveaway: async ({ commit }, { giveawayId, item }) => {
      commit("LOAD_GIVEAWAYS_START");
      const { giveaway } = await giveawayDal.addItem({ giveawayId, item });
      commit("STORE_GIVEAWAY", giveaway);
      commit("LOAD_GIVEAWAYS_STOP");
    },
    checkMintingRights: async ({ commit }, { giveawayIds }) => {
      const { grantedRights, missingRights } = await giveawayDal.checkMintingRights({ giveawayIds });
      if (Object.keys(grantedRights) || Object.keys(missingRights)) {
        commit("STORE_MINTING_RIGHTS", { giveawayIds, grantedRights, missingRights });
      } else {
        commit("LOAD_GIVEAWAYS_STOP");
      }
    }
  },
};
