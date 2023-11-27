import { updateUserInfo, setupUserInfo } from "../dal/user";
import store from "..";

export default {
  namespaced: true,
  state: () => ({
    processing: false,
    userInfo: {},
  }),
  getters: {
    userInfo: (state) => ({ location: store?.state?.auth?.session?.ipData?.location, ...state.userInfo }),
    unregistered: (state) => !state.userInfo.registeredAt,
    userDisplayName: (state) => state.userInfo.displayName,
    isEarlyAccess: (state) => state.userInfo?.roles?.includes(1),
    isAdvancedUser: (state) => state.userInfo?.roles?.includes(2),
    isVLMAdmin: (state) => !!state.userInfo?.roles?.filter((role) => role >= 7).length,
    walletAddress: (state) => (before, after) => {
      const full = state.userInfo.connectedWallet;
      if (!full) {
        return "Connection Error";
      }
      const truncated = full && full.substring(0, before) + "..." + full.substring(full.length - after);
      return truncated;
    },
    advancedUser: (state) => state.userInfo.roles.includes(2),
  },
  mutations: {
    start: (state) => (state.processing = true),
    stop: (state) => {
      state.processing = false;
    },
    updateUserInfo(state, userInfo) {
      state.userInfo = { ...state.userInfo, ...userInfo };
    },
  },
  actions: {
    async updateUserInfo({ commit }, userInfo) {
      try {
        commit("start");
        await updateUserInfo();
        commit("updateUserInfo", userInfo);
        commit("stop");
      } catch (error) {
        console.log(error);
      }
    },
    async setupUserInfo({ commit }, { newUserInfo, userOrgInfo }) {
      try {
        commit("start");
        commit("updateUserInfo", newUserInfo);
        commit("organization/updateUserOrgs", [userOrgInfo], { root: true });
        const { userInfo, userOrgs } = await setupUserInfo();
        commit("updateUserInfo", userInfo);
        commit("organization/updateUserOrgs", userOrgs, { root: true });
        commit("stop");
      } catch (error) {
        console.log(error);
      }
    },
  },
};
