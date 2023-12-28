export default {
  namespaced: true,
  state: () => ({
    userOrgs: [],
    processing: false,
  }),
  getters: {
    orgInfo: (state) => ({
      ...state.orgInfo,
    }),
  },
  mutations: {
    start: (state) => (state.processing = true),
    retry: (state) => {
      state.retries++
    },
    stop: (state, errorMessage) => {
      state.signing = false
      state.processing = false
      state.loginError = errorMessage
      state.retries = 0
    },
    updateUserOrgs(state, userOrgs) {
      state.userOrgs = userOrgs
    },
  },
  actions: {},
}
