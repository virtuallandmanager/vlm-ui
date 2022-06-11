import router from "../router";
import Web3 from "web3";
const web3 = new Web3(
  window.ethereum || (window.web3 && window.web3.currentProvider)
);

export default {
  state: () => ({
    connected: false,
    // account: "",
    testAccount: "0xc2877b05CFe462E585fE3DE8046F7528998aF6F1",
    loggingIn: false,
    loginError: null,
    noWeb3: false,
  }),
  mutations: {
    loginStart: (state) => (state.loggingIn = true),
    loginStop: (state, errorMessage) => {
      state.loggingIn = false;
      state.loginError = errorMessage;
    },
    disconnect(state) {
      console.log("Disconnecting...");
      localStorage.removeItem("loggedInAccount");
      state.account = null;
      state.connected = false;
    },
    noWeb3(state) {
      state.account = null;
      state.connected = false;
      state.noWeb3 = true;
    },
    connectAccount: (state, account) => {
      if (account) {
        localStorage.setItem("loggedInAccount", account);
        state.account = account;
        state.connected = true;
        state.noWeb3 = false;
      } else {
        state.account = null;
        state.connected = false;
      }
    },
  },
  actions: {
    async login({ commit }) {
      console.log("Logging in...");
      commit("loginStart");
      try {
        const accounts = await web3.eth.requestAccounts();
        console.log("Got connected accounts: ", accounts);
        commit("connectAccount", accounts[0]);
        router.push("/land");
        commit("loginStop", null);

        window.ethereum.on("accountsChanged", function (accounts) {
          commit("connectAccount", accounts[0]);
        });
      } catch (error) {
        commit("loginStop", null);
      }
    },
    async restoreLogin({ commit, state }) {
      console.log("Restoring session...");
      if (!(await web3.eth.getAccounts())) {
        return;
      }
      commit("loginStart");
      const accounts = state.testAccount || (await web3.eth.getAccounts());
      const loggedInAccount =
        state.testAccount || localStorage.getItem("loggedInAccount");
      if (accounts.includes(loggedInAccount)) {
        commit("connectAccount", loggedInAccount);
      } else {
        commit("disconnect");
      }
      commit("loginStop");
    },
  },
};
