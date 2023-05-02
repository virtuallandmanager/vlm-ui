import Web3 from "web3";
import { DateTime } from "luxon";
import { web3Authenticate, sendSignature, restoreSession } from "../dal/auth";
import router from "../../router";

const web3 = new Web3(window.ethereum || (window.web3 && window.web3.currentProvider));

export default {
  namespaced: true,
  state: () => ({
    connectedWallet: "",
    loggingIn: false,
    loginError: null,
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
    connected: (state) => !!(state.connectedWallet && state.sessionToken),
    userInfo: (state) => ({
      ...state.userInfo,
      location: state.sessionIpData?.location,
    }),
    walletAddress: (state) => (before, after) => {
      const full = state.connectedWallet;
      if (!full) {
        return "Connection Error";
      }
      const truncated = full && full.substring(0, before) + "..." + full.substring(full.length - after);
      return truncated;
    },
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
    restoreSessionToken: (state, sessionToken) => {
      state.sessionToken = sessionToken;
    },
    storeSession: (state, session) => {
      state.connectedWallet = session.connectedWallet;
      state.sessionExpires = session.expires;
      state.sessionToken = session.sessionToken;
      state.sessionIpData = session.ipData;
      localStorage.setItem("sessionToken", session.sessionToken);
    },
    connect(state, connectedWallet) {
      console.log("Connected.");
      state.connectedWallet = connectedWallet;
      localStorage.setItem("connectedWallet", connectedWallet);
    },
    saveSignatureMessage(state, { signatureMessage, signatureToken }) {
      state.signatureMessage = signatureMessage;
      state.signatureToken = signatureToken;
      state.signatureAccount = state.connectedWallet;
      state.sigTokenExpires = DateTime.now().plus({ minutes: 1, seconds: 30 }).toUnixInteger();
      state.signing = true;
    },
    saveSignature(state, signature) {
      state.signing = false;
      state.signature = signature;
    },
    disconnect(state) {
      console.log("Disconnecting...");
      state.connectedWallet = null;
      state.loggingIn = false;
      state.signing = false;
      state.sessionToken = false;
      state.signatureToken = false;
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("connectedWallet");
    },
  },
  actions: {
    async attemptRestoreSession({ commit, dispatch }) {
      console.log("attemptRestoreSession");

      const token = localStorage.getItem("sessionToken");

      if (token) {
        commit("start");
        commit("restoreSessionToken", token);
        await dispatch("sendTokenToServer");
      }
    },

    async sendTokenToServer({ commit, dispatch }) {
      console.log("sendTokenToServer");

      // Send token to server and handle response
      const response = await restoreSession();

      //If active session
      if (response?.status < 400) {
        await dispatch("handleSuccessfulLogin", response);
      } else if (response?.status >= 400) {
        commit("banners/showError", { message: "Session expired. Please reconnect.", timeout: 3000 }, { root: true });
      }
    },

    async connectWallet({ commit, dispatch }, newAccountList) {
      console.log("connectWallet");

      // connect the user's wallet
      commit("start");
      let accountList = newAccountList;

      if (!accountList) {
        accountList = await web3.eth.requestAccounts();
      }

      commit("connect", accountList[0]);

      // send address to the server
      dispatch("sendWalletAddress", accountList[0]);
    },

    async sendWalletAddress({ commit, dispatch }) {
      console.log("sendWalletAddress");

      // Send walletAddress to server and handle response
      const response = await web3Authenticate();

      if (response.activeSession) {
        commit("restoreSessionToken", response.sessionToken);
      }

      if (response.signatureToken) {
        commit("saveSignatureMessage", response);
        await dispatch("signMessage", response.signatureMessage);
      }
    },

    async signMessage({ commit, state, dispatch }, message) {
      console.log("signMessage");

      try {
        const signature = await web3.eth.personal.sign(message, state.connectedWallet);
        commit("saveSignature", signature);
        dispatch("sendSignature");
      } catch (error) {
        commit("disconnect");
        commit("stop", error);
        console.log("Reject message: ", error);
        return null;
      }
    },

    async sendSignature({ dispatch }) {
      console.log("sendSignature");

      const response = await sendSignature();

      if (response.status >= 400) {
        dispatch("handleFailedLogin", response);
      } else {
        dispatch("handleSuccessfulLogin", response);
      }
    },

    handleSuccessfulLogin({ commit }, response) {
      console.log("handleSuccessfulLogin");

      const { user, userOrgs, session, status } = response;

      if (user) {
        commit("user/updateUserInfo", user, { root: true });
      }

      if (userOrgs) {
        commit("organization/updateUserOrgs", userOrgs, { root: true });
      }

      if (session) {
        commit("storeSession", session);
      }

      if (status == 200) {
        router.push("/welcome");
      } else if (status == 201) {
        router.push("/join");
      }
      commit("banners/showSuccess", { message: `Welcome to VLM, ${user.displayName}!`, timeout: 2000 }, { root: true });
      commit("stop");
    },

    handleFailedLogin({ commit }) {
      console.log("handleFailedLogin");

      commit("disconnect");
      commit("stop");
      commit("banners/showError", { message: "Login failed. Please check your connection.", timeout: 5000 }, { root: true });
    },

    disconnect({ commit }) {
      console.log("disconnect");
      commit("disconnect");
    },
  },
};
