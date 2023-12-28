export default {
  namespaced: true,
  state: () => ({
    versionRestricted: {
      eventsAndGiveaways: '0.1.0',
    },
    userRestricted: {},
  }),
  getters: {
    highestIntegrationVersion: (state, getters, rootState, rootGetters) => {
      const scene = rootGetters['scene/activeScene']
      const sceneIntegrationData = scene?.locations?.map((location) => location.integrationData)
      const highestVersion = sceneIntegrationData.reduce((prev, curr) => {
        if (!curr) {
          return prev
        }
        const prevVersionParts = prev?.packageVersion.split('.').map(Number)
        const currVersionParts = curr?.packageVersion.split('.').map(Number)

        for (let i = 0; i < 3; i++) {
          if (currVersionParts[i] > prevVersionParts[i]) {
            return curr
          } else if (currVersionParts[i] < prevVersionParts[i]) {
            return prev
          }
        }
        return prev
      })
      return highestVersion || '0.0.1'
    },
    compatibleFeatures: (state, getters) => {
      const version = getters.highestIntegrationVersion
      const versionParts = version.split('.').map(Number)

      return Object.keys(state.features).filter((featureName) => {
        const featureVersion = state.features[featureName]
        const featureVersionParts = featureVersion.split('.').map(Number)

        for (let i = 0; i < 3; i++) {
          if (featureVersionParts[i] > versionParts[i]) {
            return false
          } else if (featureVersionParts[i] < versionParts[i]) {
            return true
          }
        }
        return true
      })
    },
    usesColyseus14: (state, getters) => {
      const highestIntegrationVersion = getters.highestIntegrationVersion
      const highestIntegrationVersionParts = highestIntegrationVersion.split('.')
      return highestIntegrationVersionParts[1] < 1
    },
  },
  mutations: {
    SET_FEATURE_FLAGS(state, featureList) {
      state.versionRestricted = featureList.versionRestricted
      state.userRestricted = featureList.userRestricted
    },
  },
  actions: {
    // TODO: implement a way to get feature list from server
  },
}
