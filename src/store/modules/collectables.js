import { getCollections, getCollectionItems } from '../dal/collectables'

export default {
  namespaced: true,
  state: () => ({
    userCollectionsCache: {},
    userItemsCache: {},
    loadingCollections: false,
    loadingCollectionItems: false,
  }),
  getters: {
    userCollections: (state) => state.userCollectionsCache,
    userItems: (state) => state.userItemsCache,
    loadingCollections: (state) => state.loadingCollections,
    loadingCollectionItems: (state) => state.loadingCollectionItems,
  },
  mutations: {
    LOAD_USER_COLLECTIONS_START(state) {
      state.loadingUserCollectables = true
    },
    LOAD_USER_COLLECTIONS_STOP(state) {
      state.loadingUserCollectables = false
    },
    LOAD_USER_ITEMS_START(state) {
      state.loadingCollectionItems = true
    },
    LOAD_USER_ITEMS_STOP(state) {
      state.loadingCollectionItems = false
    },
    STORE_USER_COLLECTIONS(state, userCollections) {
      userCollections.forEach((collection) => {
        state.userCollectionsCache[collection.contractAddress] = collection
      })
    },
    STORE_USER_COLLECTION_ITEMS(state, { userItems, contractAddress }) {
      state.userItemsCache[contractAddress] = userItems
    },
  },
  actions: {
    getUserCollections: async ({ commit }) => {
      try {
        commit('LOAD_USER_COLLECTIONS_START')
        const { data } = await getCollections()
        commit('STORE_USER_COLLECTIONS', data)
        commit('LOAD_USER_COLLECTIONS_STOP')
      } catch (error) {
        console.error(error)
      }
    },
    getUserCollectionItems: async ({ commit }, contractAddress) => {
      try {
        commit('LOAD_USER_ITEMS_START')
        const { data } = await getCollectionItems(contractAddress)
        commit('STORE_USER_COLLECTION_ITEMS', { userItems: data, contractAddress })
        commit('LOAD_USER_ITEMS_STOP')
      } catch (error) {
        console.error(error)
      }
    },
  },
}
