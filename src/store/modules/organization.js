export default {
  namespaced: true,
  state: () => ({
    userOrgs: [],
  }),
  getters: {
    orgInfo: (state) => ({
      ...state.orgInfo,
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
    updateUserOrgs(state, userOrgs) {
      state.userOrgs = userOrgs;
    },
  },
  actions: {},
};
