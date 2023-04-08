import Web3 from "web3";
import { DateTime } from "luxon";
import { authenticate, login } from "../dal/auth";
import router from "../../router";

const web3 = new Web3(
  window.ethereum || (window.web3 && window.web3.currentProvider)
);

export default {
  namespaced: true,
  state: () => ({
    connectedWallet: "",
    loggingIn: false,
    loginError: null,
    retries: 0,
    noWeb3: false,
    userInfo: {},
    signatureToken: "", // temp token granted to sign message and get session/sessionToken
    signatureMessage: "", // contents of crypto message signed by user
    signature: "", // hash of the cryptographically signed message from user
    signatureAccount: "", // crypto account that signed the message
    sessionToken: "", // session token used for long term login
    sigTokenExpires: "",
    signing: "",
    signingTimerInterval: null,
    showUserRegistration: false,
  }),
  getters: {
    connected: (state) => !!(state.connectedWallet && state.sessionToken),
    signing: (state) => state.signing,
    userInfo: (state) => ({  ...state.userInfo, location: state.sessionIpData?.location }),
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
    storeLogin: (state, userInfo) => {
      state.userInfo = userInfo;
      state.connectedWallet = userInfo.connectedWallet;
    },
    restoreSessionToken: (state, sessionToken) => {
      state.sessionToken = sessionToken;
      localStorage.setItem("sessionToken", sessionToken);
    },
    storeSession: (state, session) => {
      state.sessionExpires = session.expires;
      state.sessionToken = session.sessionToken;
      state.sessionIpData = session.ipData;
      localStorage.setItem("sessionToken", session.sessionToken);
    },
    connect(state, connectedWallet) {
      console.log("Connected.");
      state.connectedWallet = connectedWallet;
    },
    saveSignatureMessage(state, { text, signatureToken }) {
      state.signatureMessage = text;
      state.signatureToken = signatureToken;
      state.signatureAccount = state.connectedWallet;
      state.sigTokenExpires = DateTime.now()
        .plus({ minutes: 1, seconds: 30 })
        .toUnixInteger();
      state.signing = true;
    },
    saveSignature(state, signature) {
      state.signing = false;
      state.signature = signature;
    },
    openUserRegistration(state) {
      state.showUserRegistration = true;
    },
    closeUserRegistration(state) {
      state.showUserRegistration = false;
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
    updateUserInfo(state, userInfo) {
      state.userInfo = { ...state.userInfo, ...userInfo };
    },
  },
  actions: {
    async requestAccounts({ commit }) {
      try {
        console.log("Prompting user to connect wallet...");
        const accounts = await web3.eth.requestAccounts();
        return accounts;
      } catch (error) {
        commit("stop", null);
      }
    },
    async updateUserInfo({ commit }, userInfo) {
      commit("updateUserInfo", userInfo);
    },
    async connect({ commit, state, dispatch }, newAccountList) {
      commit("start");
      try {
        let accountList = newAccountList;

        if (!accountList) {
          accountList = await dispatch("requestAccounts");
        }

        commit("connect", accountList[0]);

        localStorage.setItem("connectedWallet", state.connectedWallet);

        if (state.sessionToken) {
          await dispatch("login");
        } else {
          await dispatch("authenticate");
        }

        window.ethereum.on("accountsChanged", function (accounts) {
          dispatch("reconnect", accounts);
        });
      } catch (error) {
        console.log(error);
        commit("stop", null);
      }
    },
    async disconnect({ commit, dispatch }, accounts) {
      try {
        localStorage.removeItem("sessionToken");
        localStorage.removeItem("connectedWallet");
        commit("disconnect");
        dispatch("connect", accounts);
      } catch (error) {
        commit("stop", error);
      }
    },
    async reconnect({ commit, dispatch }, accounts) {
      try {
        commit("disconnect");
        dispatch("connect", accounts);
      } catch (error) {
        commit("stop", error);
      }
    },
    async authenticate({ commit, dispatch }) {
      try {
        const response = await authenticate();

        if (response.sessionToken) {
          commit("restoreSessionToken", response.sessionToken);
        } else {
          commit("saveSignatureMessage", response);
          await dispatch("signMessage", response.signatureMessage);
        }
        dispatch("login");
      } catch (error) {
        commit("stop", error);
      }
    },
    async login({ commit, dispatch }, retry) {
      try {
        if (retry) {
          commit("retry");
        }
        const { status, user, session } = await login();

        await dispatch("handleLoginStatus", status);

        if (user) {
          commit("storeLogin", user);
        }

        if (session) {
          commit("storeSession", session);
        }
        commit("stop");
      } catch (error) {
        commit("stop", error);
      }
    },

    async handleLoginStatus({ commit, state, dispatch }, status) {
      try {
        if (status > 401 && state.retries == 3) {
          commit(
            "stop",
            "Login failed after 3 attempts. Please check your internet connection and then contact support."
          );
          return;
        } else if (status > 401) {
          commit("retry");
          return await dispatch("login");
        } else if (status == 401) {
          commit("disconnect");
        } else if (status == 201) {
          commit("openUserRegistration");
          router.push("/join");
        }
      } catch (error) {
        commit("stop", error);
      }
    },
    async signMessage({ commit, state }, message) {
      try {
        const signature = await web3.eth.personal.sign(
          message,
          state.connectedWallet
        );
        commit("saveSignature", signature);
        return signature;
      } catch (error) {
        commit("stop", error);
        console.log("Reject message: ", error);
        return null;
      }
    },
    restoreSession({ commit, dispatch }) {
      console.log("Restoring session token...");
      const sessionToken = localStorage.getItem("sessionToken");
      if (sessionToken) {
        commit("restoreSessionToken", sessionToken);
        dispatch("connect");
      }
    },
  },
};
