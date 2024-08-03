import giveawayDal from '../dal/giveaway'
import store from '../../store/index'
import Web3 from 'web3'

const web3 = new Web3(window.ethereum || (window.web3 && window.web3.currentProvider))

export default {
  namespaced: true,
  state: () => ({
    activeGiveaway: null,
    userGiveawayCache: {},
    adminGiveawayCache: {},
    grantedMinterRights: [],
    loadingGiveaways: false,
  }),
  getters: {
    activeEvent: (state) => state.activeEvent,
    activeGiveaway: (state) => state.userGiveawayCache[state.activeGiveaway] || state.adminGiveawayCache[state.activeGiveaway],
    loadingGiveaways: (state) => state.loadingGiveaways,
    giveawayList: (state) => {
      return state?.userGiveawayCache && Object.values(state.userGiveawayCache)
    },
    giveawayListSelect: (state) => {
      return Object.values(state.userGiveawayCache).map((giveaway) => ({ text: giveaway.name, value: giveaway.sk }))
    },
    grantedMinterRights: (state) => state.grantedMinterRights,
    allocatedAirdropCredits: (state) => {
      return Object.values(state.userGiveawayCache).reduce((acc, giveaway) => {
        return acc + giveaway?.allocatedCredits || 0
      }, 0)
    },
  },
  mutations: {
    LOAD_GIVEAWAYS_START(state) {
      state.loadingGiveaways = true
    },
    LOAD_GIVEAWAYS_STOP(state) {
      state.loadingGiveaways = false
    },
    STORE_GIVEAWAY(state, giveaway) {
      if (giveaway?.userId && giveaway?.userId !== store?.state?.user?.userInfo?.sk) {
        state.adminGiveawayCache = { ...state.adminGiveawayCache, [giveaway.sk]: giveaway }
      }
      if (giveaway?.sk) {
        state.userGiveawayCache = { ...state.userGiveawayCache, [giveaway.sk]: giveaway }
      }
    },
    STORE_GIVEAWAYS(state, giveaways) {
      giveaways.forEach((giveaway) => {
        if (giveaway?.userId && giveaway?.userId !== store.state.user.userInfo.sk) {
          state.adminGiveawayCache = { ...state.adminGiveawayCache, [giveaway.sk]: giveaway }
        } else if (giveaway?.sk) {
          state.userGiveawayCache = { ...state.userGiveawayCache, [giveaway.sk]: giveaway }
        }
      })
    },
    STORE_MINTING_RIGHTS(state, { grantedRights }) {
      // find a giveaway that has an item with a contract address that matches a key of grantedRights or mintedRights
      // if found, set the minterRightsGranted flag to true
      // if not found, set the minterRightsGranted flag to false
      Object.keys(grantedRights).forEach((contractAddress) => {
        grantedRights[contractAddress]?.forEach((itemId) => {
          state.grantedMinterRights.push(`${contractAddress}:${itemId}`)
        })
      })
    },
    SET_ACTIVE_GIVEAWAY(state, giveawayId) {
      if (giveawayId) {
        state.activeGiveaway = giveawayId
      }
    },
    CLEAR_ACTIVE_GIVEAWAY(state) {
      state.activeGiveaway = null
    },
  },
  actions: {
    setActiveGiveaway: async ({ commit }, giveawayId) => {
      commit('SET_ACTIVE_GIVEAWAY', giveawayId)
    },
    clearActiveGiveaway: async ({ commit }) => {
      commit('CLEAR_ACTIVE_GIVEAWAY')
    },
    getGiveaway: async ({ commit }, eventId, setActive = true) => {
      commit('LOAD_GIVEAWAYS_START')
      const { giveaway } = await giveawayDal.get(eventId)
      commit('STORE_GIVEAWAY', giveaway)
      if (setActive) {
        commit('SET_ACTIVE_GIVEAWAY', giveaway.sk)
      }
      commit('LOAD_GIVEAWAYS_STOP')
    },
    getGiveaways: async ({ commit, dispatch }) => {
      commit('LOAD_GIVEAWAYS_START')
      const { giveaways } = await giveawayDal.getAll()
      const giveawayIds = giveaways.map((giveaway) => giveaway.sk)
      if (giveawayIds.length) {
        await dispatch('checkMintingRights', { giveawayIds })
        commit('STORE_GIVEAWAYS', giveaways)
      }
      commit('LOAD_GIVEAWAYS_STOP')
    },
    createGiveaway: async ({ commit }) => {
      commit('LOAD_GIVEAWAYS_START')
      const { giveaway } = await giveawayDal.create()
      commit('STORE_GIVEAWAY', giveaway)
      commit('LOAD_GIVEAWAYS_STOP')
    },
    updateGiveaway: async ({ commit }, giveawayConfig) => {
      commit('LOAD_GIVEAWAYS_START')
      const { giveaway } = await giveawayDal.update(giveawayConfig)
      commit('STORE_GIVEAWAY', giveaway)
      commit('LOAD_GIVEAWAYS_STOP')
    },
    addItemsToGiveaway: async ({ commit, dispatch }, { giveawayId, items }) => {
      commit('LOAD_GIVEAWAYS_START')
      const { giveaway } = await giveawayDal.addItems({ giveawayId, items })
      commit('STORE_GIVEAWAY', giveaway)
      commit('SET_ACTIVE_GIVEAWAY', giveaway.sk)
      commit('LOAD_GIVEAWAYS_STOP')
      dispatch('checkMintingRights', { giveawayIds: [giveawayId] })
    },
    checkMintingRights: async ({ commit }, { giveawayIds }) => {
      const { grantedRights, missingRights } = await giveawayDal.checkMintingRights({ giveawayIds })
      if (!grantedRights || !missingRights) {
        commit('LOAD_GIVEAWAYS_STOP')
        return
      }

      if (Object.keys(grantedRights).length || Object.keys(missingRights).length) {
        commit('STORE_MINTING_RIGHTS', { giveawayIds, grantedRights, missingRights })
      } else {
        commit('LOAD_GIVEAWAYS_STOP')
      }
    },
    requestMintingRights: async ({ dispatch }, { giveawayId, byItem, revoke }) => {
      const { transactions } = await giveawayDal.sendMinterRightsRequest({ giveawayId, byItem, revoke })
      console.log(transactions)
      const signedTxs = []
      for (let i = 0; i < transactions.length; i++) {
        // send transaction
        transactions[i].from = store.state.auth.connectedWallet
        transactions[i].nonce = await web3.eth.getTransactionCount(store.state.auth.connectedWallet, 'latest')
        const signedTx = await web3.eth.personal.sign(transactions[i].data, store.state.auth.connectedWallet)
        // const signedTx = await window.ethereum.request({
        //   method: 'eth_signTransaction',
        //   params: [transactions[i]],
        // })
        signedTxs.push(signedTx)
      }
      dispatch('sendMinterRightsTransaction', { signedTransactions: signedTxs })
    },
    sendMinterRightsTransaction: async ({ commit }, { signedTransactions }) => {
      commit('LOAD_GIVEAWAYS_START')
      const { grantedRights, missingRights } = await giveawayDal.sendMinterRightsTransactions({ signedTransactions })
      if (!grantedRights || !missingRights) {
        commit('LOAD_GIVEAWAYS_STOP')
        return
      }
      if (Object.keys(grantedRights).length || Object.keys(missingRights).length) {
        commit('STORE_MINTING_RIGHTS', { grantedRights })
      } else {
        commit('LOAD_GIVEAWAYS_STOP')
      }
    },
  },
}
