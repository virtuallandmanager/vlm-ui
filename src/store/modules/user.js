import { updateUserInfo, setupUserInfo } from "../dal/user";
import router from "../../router";
// import store from "..";

export default {
  namespaced: true,
  state: () => ({
    userInfo: {},
  }),
  mutations: {
    start: (state) => (state.loggingIn = true),
    retry: (state) => {
      state.retries++;
    },
    stop: (state, errorMessage) => {
      state.signing = false;
      state.loggingIn = false;
      state.loginError = errorMessage;
      state.retries = 0;
    },
    updateUserInfo(state, userInfo) {
      state.userInfo = { ...state.userInfo, ...userInfo };
    },
    updateUserOrgInfo(state, userOrgInfo) {
      state.userOrgInfo = { ...state.userOrgInfo, ...userOrgInfo };
    },
  },
  actions: {
    async updateUserInfo({ commit }, userInfo) {
      try {
        await updateUserInfo();
        commit("updateUserInfo", userInfo);
      } catch (error) {
        console.log(error);
      }
    },
    async setupUserInfo({ commit }, { userInfo, userOrgInfo }) {
      try {
        console.log(userInfo);
        console.log(userOrgInfo);
        commit("updateUserInfo", userInfo);
        commit("updateUserOrgInfo", userOrgInfo);
        await setupUserInfo();
        router.push("/welcome");
      } catch (error) {
        console.log(error);
      }
    },
  },
};
