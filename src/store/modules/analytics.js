import * as analyticsDal from '../dal/analytics'

export default {
  namespaced: true,
  state: () => ({
    loadingRecentMetrics: false,
    loadingHistoricalData: false,
    recentSceneMetrics: {},
    historicalData: {},
    totalInteractions: {},
  }),
  getters: {
    loadingRecentMetrics: (state) => state.loadingRecentMetrics,
    loadingHistoricalData: (state) => state.loadingHistoricalData,
    recentSceneMetrics: (state) => (sceneId) => state.recentSceneMetrics[sceneId] || {},
    historicalData: (state) => (sceneId) => state.historicalData[sceneId] || {},
    totalInteractions: (state) => (sceneId) => state.totalInteractions[sceneId] || {},
  },
  mutations: {
    ADD_SCENE_METRICS(state, { sceneId, metrics }) {
      state.recentSceneMetrics = { ...state.recentSceneMetrics, [sceneId]: metrics }
    },
    SET_HISTORICAL_DATA(state, { sceneId, historicalData }) {
      state.historicalData[sceneId] = historicalData
      state.historicalData = { ...state.historicalData, [sceneId]: state.historicalData[sceneId] }
    },
    SET_TOTAL_INTERACTIONS(state, { sceneId, totalInteractions }) {
      state.totalInteractions[sceneId] = totalInteractions
      state.totalInteractions = { ...state.totalInteractions, [sceneId]: totalInteractions }
    },
    SET_LOADING_STATE(state, { loadType, loadingState }) {
      state[loadType] = loadingState
    },
  },
  actions: {
    async getRecentSceneMetrics({ commit }, sceneId) {
      commit('SET_LOADING_STATE', { loadType: 'loadingRecentMetrics', loadingState: true })
      const metrics = await analyticsDal.getRecentSceneMetrics(sceneId)
      commit('ADD_SCENE_METRICS', { sceneId, metrics })
      commit('SET_LOADING_STATE', { loadType: 'loadingRecentMetrics', loadingState: false })
    },
    async getHistoricalData({ commit }, { sceneId, start, end, scale, tz }) {
      commit('SET_LOADING_STATE', { loadType: 'loadingHistoricalData', loadingState: true })
      let { historicalData } = await analyticsDal.getHistoricalData({ sceneId, start, end, tz, scale })
      if (!historicalData) return
      historicalData = analyticsDal.addMissingIntervals(historicalData, start, end, tz, scale)
      let totalInteractions = analyticsDal.addTotalCounts(historicalData)
      commit('SET_HISTORICAL_DATA', { sceneId, historicalData })
      commit('SET_TOTAL_INTERACTIONS', { sceneId, totalInteractions })
      commit('SET_LOADING_STATE', { loadType: 'loadingHistoricalData', loadingState: false })
    },
  },
}
