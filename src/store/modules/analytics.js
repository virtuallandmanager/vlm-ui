import { getRecentSceneMetrics } from "../dal/analytics";

export default {
  namespaced: true,
  state: () => ({
    recentSceneMetrics: {},
  }),
  getters: {
    recentSceneMetrics: (state) => (state.uploadingVideo = true),
  },
  mutations: {
    ADD_SCENE_METRICS(state, { sceneId, metrics }) {
      if (!state.recentSceneMetrics[sceneId]) {
        state.recentSceneMetrics[sceneId] = metrics;
      } else {
        state.recentSceneMetrics[sceneId].push(metrics);
      }
    }
  },
  actions: {
    async getRecentSceneMetrics({ commit }, sceneId) {
      const metrics = await getRecentSceneMetrics(sceneId);
      commit("ADD_SCENE_METRICS", metrics);
    }
  },
};
