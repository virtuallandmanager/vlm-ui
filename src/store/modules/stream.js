import * as streamDal from '../dal/stream'

export default {
  namespaced: true,
  state: () => ({
    loadingStreams: false,
    streamList: [],
  }),
  getters: {
    loadingStreams: (state) => state.loadingStreams,
    streamList: (state) => state.streamList,
  },
  mutations: {
    ADD_STREAMS: (state, streams) => {
      streams.forEach((stream) => {
        if (state.streamList.find((s) => s.id === stream.id)) return
        state.streamList.push(stream)
      })
    },
    REMOVE_STREAMS: (state, streams) => {
      state.streamList = state.streamList.filter((stream) => stream.id !== streams.id)
    },
  },
  actions: {
    async getStreamCards({ commit }) {
      const { streams } = await streamDal.getStreamCards()

      commit('ADD_STREAMS', streams)
    },
    purchaseStream({ commit }, stream) {
      commit('ADD_STREAMS', stream)
    },
    removeStream({ commit }, stream) {
      commit('REMOVE_STREAMS', stream)
    },
  },
}
