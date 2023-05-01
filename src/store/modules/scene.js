export default {
  namespaced: true,
  state: () => ({
    activeScene: {},
    userSceneCache: {},
  }),
  getters: {
    sceneList: (state) => Object.keys(state.userSceneCache).map((id) => state.userSceneCache[id]),
  },
  mutations: {},
  actions: {
    getSceneCards() {},
    connectToScene() {},
    disconnectFromScene() {},
    //////////////////
    updateSceneImage() {},
    updateSceneVideo() {},
    updateSceneWidget() {},
    updateSceneDialog() {},
    updateSceneSound() {},
  },
};
