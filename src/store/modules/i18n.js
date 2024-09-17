import { requireLocale } from '@/helpers/requireLocales'

export default {
  namespaced: true,
  state: () => ({
    localeName: 'English (US)',
    localeCode: 'en-US',
    localeFlag: 'us',
    appName: 'Virtual Land Manager',
    actions: {},
    analytics: {},
    art: {},
    audio: {},
    claimPoints: {},
    docs: {},
    errors: {},
    events: {},
    giveaways: {},
    home: {},
    login: {},
    models: {},
    navigation: {},
    scene: {},
    sceneSettings: {},
    tooltips: {},
    units: {},
    userProfile: {},
    videoScreens: {},
  }),
  getters: {
    localeName: (state) => state.localeName,
    localeCode: (state) => state.localeCode,
    localeFlag: (state) => state.localeFlag,
    appName: (state) => state.appName,
    actions: (state) => (id) => state.actions[id],
    analytics: (state) => (id) => state.analytics[id],
    art: (state) => (id) => state.art[id],
    audio: (state) => (id) => state.audio[id],
    claimPoints: (state) => (id) => state.claimPoints[id],
    docs: (state) => (id) => state.docs[id],
    errors: (state) => (id) => state.errors[id],
    events: (state) => (id) => state.events[id],
    giveaways: (state) => (id) => state.giveaways[id],
    home: (state) => (id) => state.home[id],
    login: (state) => (id) => state.login[id],
    models: (state) => (id) => state.models[id],
    navigation: (state) => (id) => state.navigation[id],
    presets: (state) => (id) => state.presets[id],
    scene: (state) => (id) => state.scene[id],
    sceneSettings: (state) => (id) => state.sceneSettings[id],
    tooltips: (state) => (id) => state.tooltips[id],
    units: (state) => (id) => state.units[id],
    userProfile: (state) => (id) => state.userProfile[id],
    videoScreens: (state) => (id) => state.videoScreens[id],
  },
  mutations: {
    LOAD_LOCALE(state, newLocaleState) {
      state.localeCode = newLocaleState.code
      state.localeFlag = newLocaleState.flag
      const translations = newLocaleState.translations
      Object.keys(translations).forEach((key) => {
        state[key] = translations[key]
      })
    },
  },
  actions: {
    async setLocale({ commit }, locale) {
      try {
        const localeString =
          locale.split('-').length > 1
            ? `${locale.split('-')[0]}-${locale.split('-')[1].toUpperCase()}`
            : `${locale.split('-')[0]}-${locale.split('-')[0].toUpperCase()}`
        const localeData = await requireLocale(`./${localeString}.json`)
        commit('LOAD_LOCALE', localeData)
      } catch (error) {
        console.error('Error setting locale:', error)
      }
    },
  },
}
