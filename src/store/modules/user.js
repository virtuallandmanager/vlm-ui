export default {
  namespaced: true,
  state: () => ({
    userInfo: {},
  }),
  getters: {

    userInfo: (state) => ({
      ...state.userInfo,
      location: this.$store.state.auth.sessionIpData?.location,
    }),
  },
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
  },
  actions: {
    async updateUserInfo({ commit }, userInfo) {
      try {
        await this.updateUserInfo(userInfo);
        commit("updateUserInfo", userInfo);
      } catch (error) {
        console.log(error);
      }
    },
  },
};
