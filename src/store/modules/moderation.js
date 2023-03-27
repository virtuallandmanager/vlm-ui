export default {
  namespaced: true,
  state: () => ({
    error: false,
    errorMessage: "",
    sendingMessage: false,
  }),
  getters: {
    error: (state) => state.error,
    errorMessage: (state) => state.errorMessage,
  },
  mutations: {
    startMessageSend: (state) => {
      state.sendingMessage = true;
    },
    messageSendComplete: (state) => {
      state.sendingMessage = false;
    },
  },
  actions: {
    async sendUiMessage({ commit }, options) {
      const property = options.property;
      const payload = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wssMessages: options.wssMessages,
          wallet: this.state.login.account,
          property,
        }),
      };
      if (!property) {
        return;
      }
      try {
        commit("startMessageSend");
        await fetch(`${process.env.VUE_APP_API_URL}/land/message`, payload);
        commit("messageSendComplete");
      } catch (error) {
        console.log(error);
      }
    },
  },
};
