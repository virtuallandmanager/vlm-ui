import Web3 from 'web3'
import { DateTime } from 'luxon'
import { web3Authenticate, sendSignature, refreshSession } from '../dal/auth'
import router from '../../router'

let refreshTimer = null

// Initialize Web3 with the provided Ethereum provider
const web3 = new Web3(window.ethereum || (window.web3 && window.web3.currentProvider))

export default {
  namespaced: true,
  state: () => ({
    connectedWallet: '', // Stores the user's connected wallet address
    authenticated: false, // Tracks authentication status
    processing: false, // Tracks if any async operation is happening
    retries: 0, // Retry count for processes
    noWeb3: false, // Flag for checking Web3 support
    signatureToken: '', // Temp token for signing a message
    signatureMessage: '', // Message to be cryptographically signed
    signature: '', // Hash of the cryptographically signed message
    signatureAccount: '', // Crypto account that signed the message
    sessionToken: '', // Session token used for long-term login
    sigTokenExpires: '', // Expiration time for the signature token
    signing: false, // Flag indicating if a signing process is ongoing
    signingTimerInterval: null, // Reference for signature expiration timer
    refreshToken: '', // Refresh token for renewing the session token
    sessionExpires: '', // Expiration time for the session token
    sessionIpData: null, // Optional session IP-related data
  }),
  getters: {
    signing: (state) => !!state.signing, // Returns true if signing is ongoing
    loadingAuth: (state) => !!state.processing, // Returns true if any process is happening
    tokens: (state) => ({ refresh: state.refreshToken, session: state.sessionToken }), // Return both session and refresh tokens
    sigTokenExpires: (state) => state.sigTokenExpires, // Signature token expiration
    signature: (state) => state.signature, // The cryptographic signature
    signatureMessage: (state) => state.signatureMessage, // The message to be signed
    connected: (state) => !!state.connectedWallet, // Returns true if the wallet is connected
    authenticated: (state) => !!(state.connectedWallet && state.authenticated), // Returns true if authenticated
    walletAddress: (state) => (before, after) => {
      const full = state.connectedWallet
      if (!full) return 'Connection Error'

      let truncated = ''
      if (before) truncated += full.substring(0, before)
      if (before || after) truncated += '...'
      if (after) truncated += full.substring(full.length - after)

      return truncated || full
    },
  },
  mutations: {
    START: (state) => (state.processing = true), // Start a process
    RETRY: (state) => state.retries++, // Increment retry count
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
      localStorage.setItem('sessionToken', session.sessionToken)
      localStorage.setItem('refreshToken', session.refreshToken)
      localStorage.setItem('sessionTokenExpiry', session.expires) // Store the expiration time
    },
    SET_ADMIN_TOKEN: (state, { session }) => {
      state.sessionToken = session.sessionToken
    },
    CONNECT(state, connectedWallet) {
      state.connectedWallet = connectedWallet
      localStorage.setItem('connectedWallet', connectedWallet.toLowerCase()) // Persist wallet address
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
      state.refreshToken = null
      state.sessionToken = null
      state.signatureToken = null
      localStorage.removeItem('connectedWallet')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('sessionToken')
      localStorage.removeItem('sessionTokenExpiry')
    },
  },
  actions: {
    /**
     * Attempts to refresh the session using the stored refresh token.
     */
    async refreshSession({ state, commit, dispatch }) {
      const token = localStorage.getItem('refreshToken')
      const connectedWallet = localStorage.getItem('connectedWallet')

      if (!token || !connectedWallet) return false

      commit('START')

      try {
        const response = await refreshSession(token)

        if (!response.session) {
          await dispatch('handleFailedRestore')
          return false
        }

        if (response.session.connectedWallet !== connectedWallet && response.session.connectedWallet !== state.connectedWallet) {
          await dispatch('sendWalletAddress', connectedWallet || state.connectedWallet)
          return false
        }

        if (response.status < 400) {
          response.fromRefresh = true
          await dispatch('handleSuccessfulLogin', response)
          return true
        } else {
          await dispatch('handleFailedRestore')
          return false
        }
      } catch (error) {
        console.error('Error refreshing session:', error)
        await dispatch('handleFailedRestore')
        return false
      }
    },

    /**
     * Connects the user's wallet and initiates the authentication process.
     */
    async connectWallet({ commit, dispatch }, newAccountList) {
      commit('START')
      const token = localStorage.getItem('refreshToken')

      let accountList = newAccountList
      if (!accountList) accountList = await web3.eth.requestAccounts()

      commit('CONNECT', accountList[0])

      if (token) {
        return dispatch('refreshSession')
      } else {
        dispatch('sendWalletAddress', accountList[0])
      }
    },

    /**
     * Sends the connected wallet address to the server and starts the signature process.
     */
    async sendWalletAddress({ commit, dispatch }) {
      try {
        const response = await web3Authenticate()

        if (response.signatureToken) {
          commit('SAVE_SIGNATURE_MESSAGE', response)
          await dispatch('signMessage', response.signatureMessage)
        }
      } catch (error) {
        console.error('Error sending wallet address:', error)
        commit('STOP')
        dispatch('banner/showError', { message: 'Could not reach the authentication server.' }, { root: true })
      }
    },

    /**
     * Signs the authentication message using the user's wallet.
     */
    async signMessage({ commit, state, dispatch }, message) {
      try {
        const signature = await web3.eth.personal.sign(message, state.connectedWallet)
        commit('SAVE_SIGNATURE', signature)
        await dispatch('sendSignature')
      } catch (error) {
        console.error('Error signing message:', error)
        commit('STOP')
        dispatch('banner/showError', { message: 'Verification signature failed or was rejected.' }, { root: true })
      }
    },

    /**
     * Sends the user's signature to the server for authentication.
     */
    async sendSignature({ dispatch }) {
      try {
        const response = await sendSignature()

        if (response.status >= 400) {
          await dispatch('handleFailedLogin', response)
        } else {
          await dispatch('handleSuccessfulLogin', response)
        }
      } catch (error) {
        console.error('Error sending signature:', error)
        dispatch('handleFailedLogin', error)
      }
    },

    /**
     * Handles a successful login by storing user and session data.
     */
    async handleSuccessfulLogin({ commit, dispatch }, response) {
      const { user, userOrgs, session, status, fromRefresh } = response

      if (user) {
        commit('user/updateUserInfo', user, { root: true })
        dispatch('i18n/setLocale', user.locale || 'en-US', { root: true })
      } else {
        return dispatch('handleFailedLogin')
      }

      if (userOrgs) {
        commit('organization/updateUserOrgs', userOrgs, { root: true })
      }

      if (session) {
        commit('STORE_SESSION', session)
      } else {
        return dispatch('handleFailedLogin')
      }

      commit('AUTHENTICATE')

      if (status === 200 && router.currentRoute.path === '/' && !fromRefresh) {
        console.log('Redirecting to scenes...')
        console.log('current path', router.currentRoute.path)
        console.log('From Refresh', fromRefresh)
        router.push('/scenes')
      }

      if (status === 200) {
        dispatch('banner/showInfo', { message: `Welcome back, ${user.displayName}!` }, { root: true })
      } else if (status === 201) {
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
    },

    /**
     * Handles failed login attempts by resetting the authentication state.
     */
    handleFailedLogin({ dispatch }) {
      dispatch('disconnect')
      dispatch('banner/showError', { message: 'Login failed. Please check your connection.' }, { root: true })
    },

    /**
     * Handles failed session restoration by disconnecting the user.
     */
    handleFailedRestore({ dispatch }) {
      localStorage.removeItem('refreshToken')
      dispatch('disconnect')
    },

    /**
     * Automatically refreshes the session token before it expires.
     */
    autoRefreshToken({ state, dispatch }) {
      const timeToExpiry = state.sessionExpires - DateTime.now().toMillis()

      if (timeToExpiry && timeToExpiry < 5000) {
        dispatch('refreshSession')
        return
      } else if (!timeToExpiry) {
        return
      }

      clearTimeout(refreshTimer)
      refreshTimer = setTimeout(() => {
        console.log('Refreshing session token...')
        dispatch('refreshSession')
      }, timeToExpiry - 5000)
    },

    /**
     * Disconnects the user by clearing the session and redirecting to the home page.
     */
    disconnect({ commit }) {
      commit('DISCONNECT')
      router.push('/')
      commit('STOP')
    },
  },
}
