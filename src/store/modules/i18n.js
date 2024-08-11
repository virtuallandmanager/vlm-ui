const requireLocale = require.context('@/locales', true, /\.json$/)

export default {
  namespaced: true,
  state: () => ({
    appName: 'Virtual Land Manager',
    actions: {},
    errors: {},
    login: {},
    navigation: {},
    scene: {},
    events: {},
    giveaways: {},
    docs: {},
  }),
  getters: {
    appName: (state) => state.appName,
    actions: (state) => (id) => state.actions[id.toLowerCase()],
    errors: (state) => (id) => state.errors[id.toLowerCase()],
    navigation: (state) => (id) => state.navigation[id.toLowerCase()],
    scene: (state) => (id) => state.scene[id.toLowerCase()],
    events: (state) => (id) => state.events[id.toLowerCase()],
    giveaways: (state) => (id) => state.giveaways[id.toLowerCase()],
    docs: (state) => (id) => state.docs[id.toLowerCase()],
  },
  mutations: {
    LOAD_LOCALE(state, newLocaleState) {
      Object.keys(newLocaleState).forEach((key) => {
        state[key] = newLocaleState[key]
      })
    },
  },
  actions: {
    async setLocale({ commit }, locale) {
      try {
        const localeString = locale.toLowerCase()
        const localeData = await requireLocale(`./${localeString}.json`)
        commit('LOAD_LOCALE', localeData)
      } catch (error) {
        console.error('Error setting locale:', error)
      }
    },
  },
}
