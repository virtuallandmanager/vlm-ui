export default {
  namespaced: true,
  state: () => ({
    hasError: [],
    hasWarning: [],
    hasSuccess: [],
    errorMessages: [],
    warningMessages: [],
    successMessages: [],
  }),
  mutations: {
    showError: (state, { message, timeout }) => {
      state.errorMessages.push({ message, timeout });
      state.hasError.push(true);
    },
    showWarning: (state, { message, timeout }) => {
      state.warningMessages.push({ message, timeout });
      state.hasWarning.push(true);
    },
    showSuccess: (state, { message, timeout }) => {
      state.successMessages.push({ message, timeout });
      state.hasSuccess.push(true);
    },
    clearErrors: (state) => {
      state.errorMessages.length = 0;
      state.hasError.length = 0;
    },
    clearAll: (state) => {
      state.errorMessages.length = 0;
      state.warningMessages.length = 0;
      state.successMessages.length = 0;
      state.hasError.length = 0;
      state.hasWarning.length = 0;
      state.hasSuccess.length = 0;
    },
  },
  actions: {
    showError: ({ commit }, { message, timeout }) => {
      commit("showError", { message, timeout });
    },
    showWarning: ({ commit }, { message, timeout }) => {
      commit("showWarning", { message, timeout });
    },
    showSuccess: ({ commit }, { message, timeout }) => {
      commit("showSuccess", { message, timeout });
    },
  },
};
