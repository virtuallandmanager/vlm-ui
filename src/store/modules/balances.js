import { getUserBalances, claimPromotion, getPromoBalances, allocateBalance, updateUserBalance } from "../dal/balances";

export default {
  namespaced: true,
  state: () => ({
    userBalances: {},
    orgBalances: {},
    promoBalances: {},
    loadingUserBalances: false,
    loadingOrgBalances: false,
  }),
  getters: {
    userBalances: (state) => state.userBalances,
    orgBalances: (state) => state.orgBalances,
    loadingBalances: (state) => state.loadingUserBalances || state.loadingOrgBalances,
    balanceTypes: (state) => state.balanceTypes,
    userAirdropCredits: (state) => state.userBalances?.airdrop,
    userPromoBalances: (state) => state.promoBalances,
  },
  mutations: {
    LOAD_USER_BALANCES_START(state) {
      state.loadingUserBalances = true;
    },
    LOAD_USER_BALANCES_STOP(state) {
      state.loadingUserBalances = false;
    },
    UPDATE_USER_BALANCES_START(state) {
      state.updatingUserBalances = true;
    },
    UPDATE_USER_BALANCES_STOP(state) {
      state.updatingUserBalances = false;
    },
    LOAD_ORG_BALANCES_START(state) {
      state.loadingOrgBalances = true;
    },
    LOAD_ORG_BALANCES_STOP(state) {
      state.loadingOrgBalances = false;
    },
    UPDATE_ORG_BALANCES_START(state) {
      state.updatingOrgBalances = true;
    },
    UPDATE_ORG_BALANCES_STOP(state) {
      state.updatingOrgBalances = false;
    },
    STORE_USER_BALANCES(state, userBalances) {
      Object.keys(userBalances).forEach((balanceType) => {
        state.userBalances[balanceType] = userBalances[balanceType];
      });
      state.userBalances = { ...state.userBalances };
    },
    STORE_ORG_BALANCES(state, orgBalances) {
      Object.keys(orgBalances).forEach((balanceType) => {
        state.orgBalances[balanceType] = orgBalances[balanceType];
      });
      state.orgBalances = { ...state.orgBalances };
    },
    STORE_PROMO_BALANCES(state, promoBalances) {
      Object.keys(promoBalances).forEach((promoId) => {
        state.promoBalances[promoId] = promoBalances[promoId];
      });
      state.promoBalances = { ...state.promoBalances };
    },
  },
  actions: {
    getUserBalances: async ({ commit }) => {
      try {
        commit("LOAD_USER_BALANCES_START");
        const { balances, promotions } = await getUserBalances();
        commit("STORE_USER_BALANCES", balances);
        commit("STORE_PROMO_BALANCES", promotions);
        commit("LOAD_USER_BALANCES_STOP");

      } catch (error) {
        console.error(error);
      }
    },
    adjustUserBalance: async ({ commit }, { balanceType, amount }) => {
      try {
        commit("UPDATE_USER_BALANCES_START");
        const { data } = await updateUserBalance(balanceType, amount);
        commit("STORE_USER_BALANCES", data);
        commit("UPDATE_USER_BALANCES_STOP");

      } catch (error) {
        console.error(error);
      }
    },
    getPromoBalances: async ({ commit }) => {
      try {
        commit("LOAD_USER_BALANCES_START");
        const { data } = await getPromoBalances('great-dcl-airdrop');
        commit("STORE_USER_BALANCES", data);
        commit("LOAD_USER_BALANCES_STOP");

      } catch (error) {
        console.error(error);
      }
    },
    claimPromoCredits: async ({ dispatch, commit }, { promoId, amount }) => {
      try {
        commit("UPDATE_USER_BALANCES_START");
        const { balances, promotions, text, error } = await claimPromotion({ promoId, amount });
        if (error) {
          dispatch("banner/showError", { message: error }, { root: true });
        } else if (text) {
          dispatch("banner/showSuccess", { message: text }, { root: true });
          commit("STORE_USER_BALANCES", balances);
          commit("STORE_PROMO_BALANCES", promotions);
        }
        commit("UPDATE_USER_BALANCES_STOP");

      } catch (error) {
        console.error(error);
      }
    },
    allocateBalance: async ({ dispatch, commit, }, { giveawayId, amount, usePromoBalance }) => {
      try {
        commit("UPDATE_USER_BALANCES_START");
        const { balances, giveaways, text, error } = await allocateBalance({ giveawayId, balanceType: "airdrop", amount, usePromoBalance });
        if (error) {
          dispatch("banner/showError", { message: error }, { root: true });
        } else if (text) {
          dispatch("banner/showSuccess", { message: text }, { root: true });
          commit("STORE_USER_BALANCES", balances);
          commit("event/STORE_GIVEAWAYS", giveaways, { root: true });
        }
        commit("UPDATE_USER_BALANCES_STOP");

      } catch (error) {
        console.error(error);
      }
    },
  }
}
