import { createEvent, getEvent, connectToEvent, adminGetEvents } from "../dal/event";
import store from "../../store/index";

export default {
  namespaced: true,
  state: () => ({
    activeEvent: null,
    userEventCache: {},
    adminEventCache: {},
    processing: false,
  }),
  getters: {
    eventList: (state) => {
      return Object.values(state.userEventCache);
    },
  },
  mutations: {
    START(state) {
      state.processing = true;
    },
    STOP(state) {
      state.processing = false;
    },
    STORE_EVENT(state, event) {
      if (event.userId !== store.state.user.userInfo.sk) {
        state.adminEventCache = { ...state.adminEventCache, [event.sk]: event };
      }
      state.userEventCache = { ...state.userEventCache, [event.sk]: event };
    },
    SET_ACTIVE_EVENT(state, eventId) {
      if (eventId) {
        state.activeEvent = state.userEventCache[eventId] || state.adminEventCache[eventId];
      } else if (!eventId && state.activeEvent) {
        state.activeEvent = state.userEventCache[state.activeEvent.sk] || state.adminEventCache[state.activeEvent.sk];
      }
    },
    CLEAR_ACTIVE_EVENT(state) {
      state.activeEvent = null;
    },
  },
  actions: {
    createNewEvent: async ({ commit }) => {
      commit("START");
      const { event } = await createEvent();
      commit("STORE_EVENT", event);
      commit("STOP");
    },
    getEventCards: async ({ commit }) => {
      commit("START");
      const { events } = await adminGetEvents();
      if (events) {
        events.forEach((event) => {
          commit("STORE_EVENT", event);
        });
      }
      commit("STOP");
    },
    getEvent: async ({ commit }, eventId, setActive = true) => {
      commit("START");
      const { event } = await getEvent(eventId);
      commit("STORE_EVENT", event);
      if (setActive) {
        commit("SET_ACTIVE_EVENT", event.sk);
      }
      commit("STOP");
    },
    setActiveEvent: async ({ commit, dispatch }, eventId) => {
      commit("SET_ACTIVE_EVENT", eventId);
      dispatch("connectToEvent");
    },
    clearActiveEvent: async ({ commit }) => {
      commit("CLEAR_ACTIVE_EVENT");
    },
    connectToEvent() {
      connectToEvent();
    },
    disconnectFromEvent() {},
    //////////////////
    updateEventImage() {},
    updateEventVideo() {},
    updateEventWidget() {},
    updateEventDialog() {},
    updateEventSound() {},
  },
};
