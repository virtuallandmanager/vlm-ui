import { updateUserInfo, setupUserInfo } from "../dal/user";
import router from "../../router";
// import store from "..";

export default {
  namespaced: true,
  state: () => ({
    processing: false,
    userInfo: {},
  }),
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
        commit("organization/updateUserOrgs", [userOrgs], { root: true });
        commit("stop");
        router.push("/welcome");
      } catch (error) {
        console.log(error);
      }
    },
  },
};
