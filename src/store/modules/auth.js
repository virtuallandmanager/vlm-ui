import Web3 from "web3";
import { DateTime } from "luxon";
import { web3Authenticate, sendSignature, refreshSession } from "../dal/auth";

const web3 = new Web3(window.ethereum || (window.web3 && window.web3.currentProvider));

export default {
  namespaced: true,
  state: () => ({
    connectedWallet: "",
    authenticated: false,
    processing: false,
    retries: 0,
    noWeb3: false,
    signatureToken: "", // temp token granted to sign message and get session/sessionToken
    signatureMessage: "", // contents of crypto message signed by user
    signature: "", // hash of the cryptographically signed message from user
    signatureAccount: "", // crypto account that signed the message
    sessionToken: "", // session token used for long term login
    sigTokenExpires: "",
    signing: false,
    signingTimerInterval: null,
  }),
  getters: {
    signing: (state) => !!state.signing,
    loadingAuth: (state) => !!state.processing,
    sigTokenExpires: (state) => state.sigTokenExpires,
    signature: (state) => state.signature,
    signatureMessage: (state) => state.signatureMessage,
    connected: (state) => !!state.connectedWallet,
    authenticated: (state) => !!(state.connectedWallet && state.authenticated),
    walletAddress: (state) => (before, after) => {
      const full = state.connectedWallet;
      let truncated = "";

      if (!full) {
        return "Connection Error";
      }

      if (before) {
        truncated += full.substring(0, before);
      }

      if (before || after) {
        truncated += "...";
      }

      if (after) {
        truncated += full.substring(full.length - after);
      }
      return truncated || full;
    },
  },
  mutations: {
    START: (state) => (state.processing = true),
    RETRY: (state) => {
      state.retries++;
    },
    STOP: (state) => {
      state.signing = false;
      state.processing = false;
      state.retries = 0;
    },
    STORE_SESSION: (state, session) => {
      state.connectedWallet = session.connectedWallet;
      state.sessionExpires = session.expires;
      state.sessionToken = session.sessionToken;
      state.refreshToken = session.refreshToken;
      state.sessionIpData = session.ipData;
      localStorage.setItem("refreshToken", session.refreshToken);
    },
    CONNECT(state, connectedWallet) {
      state.connectedWallet = connectedWallet;
      localStorage.setItem("connectedWallet", connectedWallet);
    },
    AUTHENTICATE(state) {
      state.authenticated = true;
    },
    SAVE_SIGNATURE_MESSAGE(state, { signatureMessage, signatureToken }) {
      state.signatureMessage = signatureMessage;
      state.signatureToken = signatureToken;
      state.signatureAccount = state.connectedWallet;
      state.sigTokenExpires = DateTime.now().plus({ minutes: 1, seconds: 30 }).toUnixInteger();
      state.signing = true;
    },
    SAVE_SIGNATURE(state, signature) {
      state.signing = false;
      state.signature = signature;
      state.sigTokenExpires = null;
    },
    DISCONNECT(state) {
      state.authenticated = false;
      state.connectedWallet = null;
      state.processing = false;
      state.signing = false;
      state.sessionToken = false;
      state.signatureToken = false;
    },
  },
  actions: {
    async refreshSession({ commit, dispatch }) {
      const token = localStorage.getItem("refreshToken");
      if (!token) {
        return false;
      }

      commit("START");
      // Send token to server and handle response
      const response = await refreshSession(token);

      //If active session
      if (response?.status < 400) {
        await dispatch("handleSuccessfulLogin", response);
        return true;
      } else if (response?.status >= 400) {
        await dispatch("handleFailedRestore");
        return false;
      }
    },

    async connectWallet({ commit, dispatch }, newAccountList) {

      // connect the user's wallet
      commit("START");
      let accountList = newAccountList;

      if (!accountList) {
        accountList = await web3.eth.requestAccounts();
      }

      commit("CONNECT", accountList[0]);

      // send address to the server
      dispatch("sendWalletAddress", accountList[0]);
    },

    async sendWalletAddress({ commit, dispatch }) {

      // Send walletAddress to server and handle response
      try {
        const response = await web3Authenticate();

        if (response.signatureToken) {
          commit("SAVE_SIGNATURE_MESSAGE", response);
          await dispatch("signMessage", response.signatureMessage);
        }
      } catch (error) {
        commit("STOP", error);
        dispatch("banner/showError", { message: "Could not reach the authentication server." }, { root: true });
        return;
      }
    },

    async signMessage({ commit, state, dispatch }, message) {

      try {
        const signature = await web3.eth.personal.sign(message, state.connectedWallet);
        commit("SAVE_SIGNATURE", signature);
        dispatch("sendSignature");
      } catch (error) {
        commit("STOP", error);
        dispatch("banner/showError", { message: "Verification signature failed or was rejected." }, { root: true });
        return null;
      }
    },

    async sendSignature({ dispatch }) {

      const response = await sendSignature();

      if (response.status >= 400) {
        dispatch("handleFailedLogin", response);
      } else {
        dispatch("handleSuccessfulLogin", response);
      }
    },

    async handleSuccessfulLogin({ commit, dispatch }, response) {
      const { user, userOrgs, session, status } = response;

      if (user) {
        commit("user/updateUserInfo", user, { root: true });
      } else {
        dispatch("handleFailedLogin");
      }

      if (userOrgs) {
        commit("organization/updateUserOrgs", userOrgs, { root: true });
      }

      if (session) {
        commit("STORE_SESSION", session);
      } else {
        dispatch("handleFailedLogin");
        return;
      }

      commit("AUTHENTICATE");

      if (status == 200) {
        dispatch("banner/showInfo", { message: `Welcome back, ${user.displayName}!` }, { root: true });
      } else if (status == 201) {
        dispatch("banner/showInfo", { message: `Welcome to VLM!` }, { root: true });
      }

      await Promise.all([
        dispatch("scene/getSceneCards", null, { root: true }),
        dispatch("balances/getUserBalances", user, { root: true }),
        dispatch("event/getEvents", user, { root: true }),
        dispatch("giveaway/getGiveaways", user, { root: true })
      ]);

      dispatch("autoRefreshToken");

      commit("STOP");
      return true;
    },

    handleFailedLogin({ dispatch }) {
      dispatch("disconnect");
      dispatch("banner/showError", { message: "Login failed. Please check your connection." }, { root: true });
      return false;
    },

    handleFailedRestore({ dispatch }) {
      localStorage.removeItem("refreshToken");
      dispatch("disconnect");
      return false;
    },

    autoRefreshToken({ state }) {
      const timeToExpiry = state.sessionExpires - DateTime.now().toSeconds();

      setTimeout(() => {
        this.dispatch("refreshSession");
      }, (timeToExpiry * 1000) - 5000);
    },

    disconnect({ commit }) {
      commit("DISCONNECT");
      commit("STOP");
    },
  },
};
