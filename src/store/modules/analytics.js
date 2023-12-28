import { getRecentSceneMetrics, getHistoricalData } from '../dal/analytics'

export default {
  namespaced: true,
  state: () => ({
    recentSceneMetrics: {},
    historicalData: {},
  }),
  getters: {
    recentSceneMetrics: (state) => state.recentSceneMetrics,
  },
  mutations: {
    ADD_SCENE_METRICS(state, { sceneId, metrics }) {
      if (!state.recentSceneMetrics[sceneId]) {
        state.recentSceneMetrics[sceneId] = metrics
      } else {
        state.recentSceneMetrics[sceneId].push(metrics)
      }
    },
    ADD_HISTORICAL_DATA(state, { sceneId, metrics }) {
      if (!state.historicalData[sceneId]) {
        state.historicalData[sceneId] = metrics
      } else {
        state.historicalData[sceneId].push(metrics)
      }
    },
  },
  actions: {
    async getRecentSceneMetrics({ commit }, sceneId) {
      const metrics = await getRecentSceneMetrics(sceneId)
      commit('ADD_SCENE_METRICS', metrics)
    },
    async getHistoricalData({ commit }, sceneId, dateRange) {
      const metrics = await getHistoricalData(sceneId, dateRange)
      commit('ADD_HISTORICAL_DATA', metrics)
    },
  },
}
