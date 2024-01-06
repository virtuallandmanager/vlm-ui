import { getRecentSceneMetrics, getHistoricalData } from '../dal/analytics'

export default {
  namespaced: true,
  state: () => ({
    recentSceneMetrics: {},
    historicalData: {},
  }),
  getters: {
    recentSceneMetrics: (state) => (sceneId) => state.recentSceneMetrics[sceneId] || {},
    historicalData: (state) => (sceneId) => state.historicalData[sceneId] || [],
  },
  mutations: {
    ADD_SCENE_METRICS(state, { sceneId, metrics }) {
      state.recentSceneMetrics = { ...state.recentSceneMetrics, [sceneId]: metrics }
    },
    ADD_HISTORICAL_DATA(state, { sceneId, metrics }) {
      if (!state.historicalData[sceneId]) {
        state.historicalData[sceneId] = metrics
      } else {
        state.historicalData = { ...state.historicalData, [sceneId]: metrics }
      }
    },
  },
  actions: {
    async getRecentSceneMetrics({ commit }, sceneId) {
      const metrics = await getRecentSceneMetrics(sceneId)
      commit('ADD_SCENE_METRICS', { sceneId, metrics })
    },
    async getHistoricalData({ commit }, sceneId, dateRange) {
      if (!dateRange) {
        return
      }
      const metrics = await getHistoricalData(sceneId, dateRange, 'day')
      commit('ADD_HISTORICAL_DATA', { sceneId, metrics })
    },
  },
}
