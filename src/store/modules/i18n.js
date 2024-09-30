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
    colors: {},
    clickActionDialog: {},
    dateRangeBar: {},
    deleteDialog: {},
    docs: {},
    errors: {},
    events: {},
    giveaways: {},
    home: {},
    login: {},
    logo: {},
    models: {},
    moderation: {},
    nameDialog: {},
    navigation: {},
    presets: {},
    privacySettings: {},
    propertiesDialog: {},
    scene: {},
    scenePresets: {},
    sceneSettings: {},
    tooltips: {},
    units: {},
    userProfile: {},
    videoScreens: {},
    widgets: {},
  }),
  getters: {
    localeName: (state) => state.localeName,
    localeCode: (state) => state.localeCode,
    localeFlag: (state) => state.localeFlag,
    localeLogo: (state) => state.localeLogo,
    appName: (state) => state.appName,
    actions: (state) => (id) => state.actions[id],
    analytics: (state) => (id) => state.analytics[id],
    art: (state) => (id) => state.art[id],
    audio: (state) => (id) => state.audio[id],
    colors: (state) => (id) => state.colors[id],
    claimPoints: (state) => (id) => state.claimPoints[id],
    clickActionDialog: (state) => (id) => state.clickActionDialog[id],
    dateRangeBar: (state) => (id) => state.dateRangeBar[id],
    deleteDialog: (state) => (id) => state.deleteDialog[id],
    docs: (state) => (id) => state.docs[id],
    errors: (state) => (id) => state.errors[id],
    events: (state) => (id) => state.events[id],
    giveaways: (state) => (id) => state.giveaways[id],
    home: (state) => (id) => state.home[id],
    login: (state) => (id) => state.login[id],
    models: (state) => (id) => state.models[id],
    moderation: (state) => (id) => state.moderation[id],
    nameDialog: (state) => (id) => state.nameDialog[id],
    navigation: (state) => (id) => state.navigation[id],
    privacySettings: (state) => (id) => state.privacySettings[id],
    propertiesDialog: (state) => (id) => state.propertiesDialog[id],
    scene: (state) => (id) => state.scene[id],
    scenePresets: (state) => (id) => state.scenePresets[id],
    sceneSettings: (state) => (id) => state.sceneSettings[id],
    tooltips: (state) => (id) => state.tooltips[id],
    units: (state) => (id) => state.units[id],
    userProfile: (state) => (id) => state.userProfile[id],
    videoScreens: (state) => (id) => state.videoScreens[id],
    widgets: (state) => (id) => state.widgets[id],
  },
  mutations: {
    LOAD_LOCALE(state, newLocaleState) {
      state.localeCode = newLocaleState.code
      state.localeFlag = newLocaleState.flag
      state.localeName = newLocaleState.name
      state.localeLogo = newLocaleState.logo
      const translations = newLocaleState.translations
      Object.keys(translations).forEach((key) => {
        state[key] = translations[key]
      })
    },
  },
  actions: {
    async setLocale({ commit, dispatch, rootGetters }, locale) {
      try {
        const userInfo = rootGetters['user/userInfo']
        const authenticated = rootGetters['auth/authenticated']
        const supportedLocales = await requireLocale(`./locales.json`)
        const localeParts = locale.split('-')
        let localeString =
          locale.split('-').length > 1 ? `${localeParts[0]}-${localeParts[1].toUpperCase()}` : `${localeParts[0]}-${localeParts[0].toUpperCase()}`
        const exactLocale = supportedLocales.find((supportedLocale) => supportedLocale.code === localeString)
        const closestLocale = supportedLocales.find((supportedLocale) => supportedLocale.code.includes(localeParts[0]))
        const defaultLocaleCode = 'en-US'
        localeString = exactLocale?.code || closestLocale?.code || userInfo.locale || defaultLocaleCode
        const localeData = await requireLocale(`./${localeString}.json`)

        commit('LOAD_LOCALE', localeData)
        if (authenticated && userInfo) {
          await dispatch('user/updateUserInfo', { userInfo: { ...userInfo, locale: localeString } }, { root: true })
        }
      } catch (error) {
        console.error('Error setting locale:', error)
      }
    },
  },
}
