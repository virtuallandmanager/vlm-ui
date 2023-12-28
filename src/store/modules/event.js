import eventDal from '../dal/event'

export default {
  namespaced: true,
  state: () => ({
    activeEvent: null,
    userEventCache: {},
    sceneLinks: [],
    giveawayLinks: [],
    adminEventCache: {},
    loadingProperties: [],
    loadingEvents: false,
    loadingEvent: false,
  }),
  getters: {
    activeEvent: (state) => state.activeEvent,
    loadingEvents: (state) => state.loadingEvents,
    loadingEvent: (state) => state.loadingEvent,
    loadingProperties: (state) => state.loadingProperties,
    sceneLinks: (state) => state.sceneLinks,
    giveawayLinks: (state) => state.giveawayLinks,
    eventList: (state) => {
      return Object.values(state.userEventCache)
    },
    giveawaysForEvent: (state, getters, rootState) => (eventId) => {
      const links = state.giveawayLinks.filter((link) => link.eventId === eventId)
      return links.map((link) => rootState.giveaway?.userGiveawayCache[link.giveawayId])
    },
    scenesForEvent: (state, getters, rootState) => (eventId) => {
      const scenes = state.sceneLinks.filter((link) => link.eventId === eventId)
      return scenes.map((link) => rootState.scene?.userSceneCache[link.sceneId])
    },
    eventsForGiveaway: (state, getters, rootState) => (giveawayId) => {
      const links = state.giveawayLinks.filter((link) => link.giveawayId === giveawayId)
      return links.map((link) => rootState.event?.userEventCache[link.eventId])
    },
    eventsForScene: (state, getters, rootState) => (sceneId) => {
      const links = state.sceneLinks.filter((link) => link.sceneId === sceneId)
      return links.map((link) => rootState.event?.userEventCache[link.eventId])
    },
    giveawaysForScene: (state, getters) => (sceneId) => {
      const events = getters.eventsForScene(sceneId)
      const giveaways = events.map((eventObj) => {
        return getters.giveawaysForEvent(eventObj.sk)
      })
      return giveaways.flat()
    },
  },
  mutations: {
    LOAD_EVENTS_START(state) {
      state.loadingEvents = true
    },
    LOAD_EVENTS_STOP(state) {
      state.loadingEvents = false
    },
    LOAD_EVENT_START(state) {
      state.loadingEvent = true
    },
    LOAD_EVENT_STOP(state) {
      state.loadingEvent = false
    },
    STORE_EVENT(state, event, rootState) {
      if (!event) {
        return
      }
      if (event.userId !== rootState?.user?.userInfo?.sk) {
        state.adminEventCache = { ...state.adminEventCache, [event.sk]: event }
      }
      state.userEventCache = { ...state.userEventCache, [event.sk]: event }
    },
    STORE_SCENE_LINKS(state, sceneLinks) {
      if (sceneLinks) {
        state.sceneLinks = sceneLinks
      }
    },
    STORE_SCENE_LINK(state, sceneLink) {
      if (sceneLink && !state.sceneLinks.find((link) => link.sk === sceneLink.sk)) {
        state.sceneLinks.push(sceneLink)
      } else {
        state.sceneLinks.splice(
          state.sceneLinks.findIndex((link) => link.sk === sceneLink.sk),
          1,
          sceneLink
        )
      }
    },
    STORE_GIVEAWAY_LINKS(state, giveawayLinks) {
      if (giveawayLinks) {
        state.giveawayLinks = giveawayLinks
      }
    },
    STORE_GIVEAWAY_LINK(state, giveawayLink) {
      if (giveawayLink && !state.giveawayLinks.find((link) => link.sk === giveawayLink.sk)) {
        state.giveawayLinks.push(giveawayLink)
      } else {
        state.giveawayLinks.splice(
          state.giveawayLinks.findIndex((link) => link.sk === giveawayLink.sk),
          1,
          giveawayLink
        )
      }
    },
    REMOVE_SCENE_LINK(state, linkId) {
      if (linkId) {
        state.sceneLinks = state.sceneLinks.filter((link) => link.sk !== linkId)
      }
    },
    REMOVE_GIVEAWAY_LINK(state, linkId) {
      if (linkId) {
        state.giveawayLinks = state.giveawayLinks.filter((link) => link.sk !== linkId)
      }
    },
    SET_ACTIVE_EVENT(state, eventId) {
      if (eventId) {
        state.activeEvent = state.userEventCache[eventId] || state.adminEventCache[eventId]
      } else if (!eventId && state.activeEvent) {
        state.activeEvent = state.userEventCache[state.activeEvent.sk] || state.adminEventCache[state.activeEvent.sk]
      }
    },
    CLEAR_ACTIVE_EVENT(state) {
      state.activeEvent = null
    },
    ADD_LOADING_PROPERTY(state, property) {
      if (property) {
        state.loadingProperties = [...state.loadingProperties, property]
      }
    },
    CLEAR_LOADING_PROPERTY(state, property) {
      if (property) {
        state.loadingProperties = state.loadingProperties.filter((prop) => prop !== property)
      }
    },
  },
  actions: {
    setActiveEvent: async ({ commit }, eventId) => {
      commit('SET_ACTIVE_EVENT', eventId)
    },
    clearActiveEvent: async ({ commit }) => {
      commit('CLEAR_ACTIVE_EVENT')
    },
    createEvent: async ({ commit }, eventConfig) => {
      commit('LOAD_EVENTS_START')
      const { event } = await eventDal.create(eventConfig)
      commit('STORE_EVENT', event)
      commit('LOAD_EVENTS_STOP')
    },
    getEvents: async ({ commit }) => {
      commit('LOAD_EVENTS_START')
      const { events, giveawayLinks, sceneLinks } = await eventDal.getAll()
      if (events) {
        events.forEach((event) => {
          commit('STORE_EVENT', event)
        })
      }
      if (giveawayLinks) {
        giveawayLinks.forEach((giveawayLink) => {
          commit('STORE_GIVEAWAY_LINK', giveawayLink)
        })
      }
      if (sceneLinks) {
        sceneLinks.forEach((sceneLink) => {
          commit('STORE_SCENE_LINK', sceneLink)
        })
      }
      commit('LOAD_EVENTS_STOP')
    },
    getEvent: async ({ commit }, eventId, setActive = true) => {
      commit('LOAD_EVENT_START')
      const { event, sceneLinks, giveawayLinks } = await eventDal.get(eventId)
      commit('STORE_EVENT', event)
      if (giveawayLinks) {
        giveawayLinks.forEach((giveawayLink) => {
          commit('STORE_GIVEAWAY_LINK', giveawayLink)
        })
      }
      if (sceneLinks) {
        sceneLinks.forEach((sceneLink) => {
          commit('STORE_SCENE_LINK', sceneLink)
        })
      }
      if (setActive) {
        commit('SET_ACTIVE_EVENT', event.sk)
      }
      commit('LOAD_EVENT_STOP')
    },
    updateEvent: async ({ commit, dispatch }, { eventConfig, property }) => {
      if (property) {
        commit('ADD_LOADING_PROPERTY', property)
      } else {
        commit('LOAD_EVENTS_START')
      }
      commit('STORE_EVENT', eventConfig)
      let { event, error } = await eventDal.update(eventConfig)
      if (error) {
        dispatch('banner/showError', { message: error }, { root: true })
      }
      commit('STORE_EVENT', event)
      if (property) {
        commit('CLEAR_LOADING_PROPERTY', property)
      } else {
        commit('LOAD_EVENTS_STOP')
      }
    },
    updateSceneLinks: async ({ commit }, { eventId, sceneLinkIds }) => {
      commit('ADD_LOADING_PROPERTY', 'linkedScenes')
      const { sceneLinks } = await eventDal.updateSceneLinks({ eventId, sceneLinkIds })
      if (sceneLinks) {
        commit('STORE_SCENE_LINKS', sceneLinks)
      }
      commit('CLEAR_LOADING_PROPERTY', 'linkedScenes')
    },
    updateGiveawayLinks: async ({ commit }, { eventId, giveawayLinkIds }) => {
      commit('ADD_LOADING_PROPERTY', 'linkedGiveaways')
      const { giveawayLinks } = await eventDal.updateGiveawayLinks({ eventId, giveawayLinkIds })
      if (giveawayLinks) {
        commit('STORE_GIVEAWAY_LINKS', giveawayLinks)
      }
      commit('CLEAR_LOADING_PROPERTY', 'linkedGiveaways')
    },
    linkScene: async ({ commit }, { eventId, sceneId }) => {
      commit('ADD_LOADING_PROPERTY', 'linkedScenes')
      const { sceneLink } = await eventDal.linkScene({ eventId, sceneId })
      commit('STORE_SCENE_LINK', sceneLink)
      commit('CLEAR_LOADING_PROPERTY', 'linkedScenes')
    },
    linkGiveaway: async ({ commit }, { eventId, giveawayId }) => {
      commit('ADD_LOADING_PROPERTY', 'linkedGiveaways')
      const { giveawayLink } = await eventDal.linkGiveaway({ eventId, giveawayId })
      commit('STORE_GIVEAWAY_LINK', giveawayLink)
      commit('CLEAR_LOADING_PROPERTY', 'linkedGiveaways')
    },
    unlinkScene: async ({ commit }, { eventId, sceneId }) => {
      commit('LOAD_EVENTS_START')
      const { success, linkId } = await eventDal.unlinkScene({ eventId, sceneId })
      if (success && linkId) {
        commit('REMOVE_SCENE_LINK', linkId)
      }
      commit('LOAD_EVENTS_STOP')
    },
    unlinkGiveaway: async ({ commit }, { eventId, giveawayId }) => {
      commit('LOAD_EVENTS_START')
      const { success, linkId } = await eventDal.unlinkGiveaway({ eventId, giveawayId })
      if (success && linkId) {
        commit('REMOVE_GIVEAWAY_LINK', linkId)
      }
      commit('LOAD_EVENTS_STOP')
    },
  },
}
