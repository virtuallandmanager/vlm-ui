import Web3 from 'web3'
import { DateTime } from 'luxon'
import { web3Authenticate, sendSignature, refreshSession } from '../dal/auth'
import router from '../../router'

const web3 = new Web3(window.ethereum || (window.web3 && window.web3.currentProvider))

export default {
  namespaced: true,
  state: () => ({
    connectedWallet: '',
    authenticated: false,
    processing: false,
    retries: 0,
    noWeb3: false,
    signatureToken: '', // temp token granted to sign message and get session/sessionToken
    signatureMessage: '', // contents of crypto message signed by user
    signature: '', // hash of the cryptographically signed message from user
    signatureAccount: '', // crypto account that signed the message
    sessionToken: '', // session token used for long term login
    sigTokenExpires: '',
    signing: false,
    signingTimerInterval: null,
  }),
  getters: {
    signing: (state) => !!state.signing,
    loadingAuth: (state) => !!state.processing,
    tokens: (state) => ({ refresh: state.refreshToken, session: state.sessionToken }),
    sigTokenExpires: (state) => state.sigTokenExpires,
    signature: (state) => state.signature,
    signatureMessage: (state) => state.signatureMessage,
    connected: (state) => !!state.connectedWallet,
    authenticated: (state) => !!(state.connectedWallet && state.authenticated),
    walletAddress: (state) => (before, after) => {
      const full = state.connectedWallet
      let truncated = ''

      if (!full) {
        return 'Connection Error'
      }

      if (before) {
        truncated += full.substring(0, before)
      }

      if (before || after) {
        truncated += '...'
      }

      if (after) {
        truncated += full.substring(full.length - after)
      }
      return truncated || full
    },
  },
  mutations: {
    START: (state) => (state.processing = true),
    RETRY: (state) => {
      state.retries++
    },
    STOP: (state) => {
      state.signing = false
      state.processing = false
      state.retries = 0
    },
    STORE_SESSION: (state, session) => {
      state.connectedWallet = session.connectedWallet
      state.sessionExpires = session.expires
      state.sessionToken = session.sessionToken
      state.refreshToken = session.refreshToken
      state.sessionIpData = session.ipData
      localStorage.setItem('refreshToken', session.refreshToken)
    },
    SET_ADMIN_TOKEN: (state, { session }) => {
      state.sessionToken = session.sessionToken
    },
    CONNECT(state, connectedWallet) {
      state.connectedWallet = connectedWallet
      localStorage.setItem('connectedWallet', connectedWallet.toLowerCase())
    },
    AUTHENTICATE(state) {
      state.authenticated = true
    },
    SAVE_SIGNATURE_MESSAGE(state, { signatureMessage, signatureToken }) {
      state.signatureMessage = signatureMessage
      state.signatureToken = signatureToken
      state.signatureAccount = state.connectedWallet
      state.sigTokenExpires = DateTime.now().plus({ minutes: 1, seconds: 30 }).toMillis()
      state.signing = true
    },
    SAVE_SIGNATURE(state, signature) {
      state.signing = false
      state.signature = signature
      state.sigTokenExpires = null
    },
    DISCONNECT(state) {
      state.authenticated = false
      state.connectedWallet = null
      state.processing = false
      state.signing = false
      state.refreshToken = false
      state.sessionToken = false
      state.signatureToken = false
      localStorage.removeItem('connectedWallet')
      localStorage.removeItem('refreshToken')
    },
  },
  actions: {
    async refreshSession({ state, commit, dispatch }) {
      const token = localStorage.getItem('refreshToken')
      const connectedWallet = localStorage.getItem('connectedWallet')
      if (!token || !connectedWallet) {
        return false
      }

      commit('START')

      // Send token to server and handle response
      const response = await refreshSession(token)

      if (!response.session) {
        await dispatch('handleFailedRestore')
        return false
      }

      if (response?.session.connectedWallet !== connectedWallet && response?.session.connectedWallet !== state.connectedWallet) {
        await dispatch('sendWalletAddress', connectedWallet || state.connectedWallet)
        return false
      }

      //If active session
      if (response?.status < 400) {
        await dispatch('handleSuccessfulLogin', response)
        return true
      } else if (response?.status >= 400) {
        await dispatch('handleFailedRestore')
        return false
      }
    },

    async connectWallet({ commit, dispatch }, newAccountList) {
      // connect the user's wallet
      commit('START')
      const token = localStorage.getItem('refreshToken')

      let accountList = newAccountList

      if (!accountList) {
        accountList = await web3.eth.requestAccounts()
      }

      commit('CONNECT', accountList[0])

      if (token) {
        return dispatch('refreshSession')
      } else {
        // send address to the server
        dispatch('sendWalletAddress', accountList[0])
      }
    },

    async sendWalletAddress({ commit, dispatch }) {
      // Send walletAddress to server and handle response
      try {
        const response = await web3Authenticate()

        if (response.signatureToken) {
          commit('SAVE_SIGNATURE_MESSAGE', response)
          await dispatch('signMessage', response.signatureMessage)
        }
      } catch (error) {
        commit('STOP', error)
        dispatch('banner/showError', { message: 'Could not reach the authentication server.' }, { root: true })
        return
      }
    },

    async signMessage({ commit, state, dispatch }, message) {
      try {
        const signature = await web3.eth.personal.sign(message, state.connectedWallet)
        commit('SAVE_SIGNATURE', signature)
        dispatch('sendSignature')
      } catch (error) {
        commit('STOP', error)
        dispatch('banner/showError', { message: 'Verification signature failed or was rejected.' }, { root: true })
        return null
      }
    },

    async sendSignature({ dispatch }) {
      const response = await sendSignature()

      if (response.status >= 400) {
        dispatch('handleFailedLogin', response)
      } else {
        dispatch('handleSuccessfulLogin', response)
      }
    },

    async handleSuccessfulLogin({ commit, dispatch }, response) {
      const { user, userOrgs, session, status } = response

      if (user) {
        commit('user/updateUserInfo', user, { root: true })
      } else {
        dispatch('handleFailedLogin')
      }

      if (userOrgs) {
        commit('organization/updateUserOrgs', userOrgs, { root: true })
      }

      if (session) {
        commit('STORE_SESSION', session)
      } else {
        dispatch('handleFailedLogin')
        return
      }

      commit('AUTHENTICATE')

      if (status == 200) {
        router.push('/scenes')
        dispatch('banner/showInfo', { message: `Welcome back, ${user.displayName}!` }, { root: true })
      } else if (status == 201) {
        router.push('/join')
        dispatch('banner/showInfo', { message: `Welcome to VLM!` }, { root: true })
      }

      await Promise.all([
        dispatch('i18n/setLocale', user.locale || 'en-us', { root: true }),
        dispatch('scene/getSceneCards', null, { root: true }),
        dispatch('balances/getUserBalances', user, { root: true }),
        dispatch('event/getEvents', user, { root: true }),
        dispatch('giveaway/getGiveaways', user, { root: true }),
      ])

      dispatch('autoRefreshToken')

      commit('STOP')
      return true
    },

    handleFailedLogin({ dispatch }) {
      dispatch('disconnect')
      dispatch('banner/showError', { message: 'Login failed. Please check your connection.' }, { root: true })
      return false
    },

    handleFailedRestore({ dispatch }) {
      localStorage.removeItem('refreshToken')
      dispatch('disconnect')
      return false
    },

    autoRefreshToken({ state, dispatch }) {
      const timeToExpiry = state.sessionExpires - DateTime.now().toMillis()

      setTimeout(() => {
        dispatch('refreshSession')
      }, timeToExpiry - 5000)
    },

    disconnect({ commit }) {
      commit('DISCONNECT')
      router.push('/')
      commit('STOP')
    },
  },
}
