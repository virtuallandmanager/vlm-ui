export default {
  namespaced: true,
  state: () => ({
    show: false,
    message: '',
    color: '',
    timeout: '',
  }),
  mutations: {
    showSnackbar(state, { message, color, timeout }) {
      state.show = true
      state.message = message
      state.color = color
      state.timeout = timeout
    },
    hideSnackbar(state) {
      state.show = false
      state.message = ''
      state.color = ''
      state.timeout = ''
    },
  },
  actions: {
    showError: ({ commit }, { message, timeout }) => {
      commit('showSnackbar', { message, color: 'red', timeout })
    },
    showWarning: ({ commit }, { message, timeout }) => {
      commit('showSnackbar', { message, color: 'yellow', timeout })
    },
    showInfo: ({ commit }, { message, timeout }) => {
      commit('showSnackbar', { message, color: 'primary', timeout })
    },
    showSuccess: ({ commit }, { message, timeout }) => {
      commit('showSnackbar', { message, color: 'green', timeout })
    },
  },
}
