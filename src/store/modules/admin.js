import { DateTime } from "luxon";
import { getUsers, getScenes, getOrganizations, getAdminPanelKeys } from "../dal/admin";

function mergeSetId(arr1, arr2, id) {
  const mergedArray = [...arr1];

  for (const item of arr2) {
    const existingSkItem = mergedArray.findIndex((user) => user.sk === item.sk);
    if (id && existingSkItem) {
      item[id] = item.sk;
    }
    if (existingSkItem < 0) {
      mergedArray.push(item);
    } else {
      mergedArray[existingSkItem] = item;
    }
  }

  return mergedArray;
}

const humanizeDateTimes = (arr) => {
  arr.forEach((obj) => {
    if (obj.humanized) {
      return;
    }
    if (obj.created) {
      obj.created = DateTime.fromSeconds(obj.created).toLocaleString();
    }
    if (obj.createdAt) {
      obj.createdAt = DateTime.fromSeconds(obj.createdAt).toLocaleString();
    }
    if (obj.registeredAt) {
      obj.registeredAt = DateTime.fromSeconds(obj.registeredAt).toLocaleString();
    }
    if (obj.ts) {
      obj.lastModified = DateTime.fromMillis(obj.ts).toRelative();
    }
    obj.humanized = true;
  });
};

export default {
  namespaced: true,
  state: () => ({
    processing: false,
    initialized: false,
    userCache: [],
    orgCache: [],
    sceneCache: [],
    eventCache: [],
    userSessionCache: [],
    analyticsSessionCache: [],
    userPage: 1,
    userPageSize: 100,
    userSessionPage: 1,
    userSessionPageSize: 100,
    analyticsSessionPage: 1,
    analyticsSessionPageSize: 100,
    orgPage: 1,
    orgPageSize: 100,
    scenePage: 1,
    scenePageSize: 100,
    eventPage: 1,
    eventPageSize: 100,
  }),
  getters: {
    users: (state) => state.userCache,
    organizations: (state) => state.orgCache,
    scenes: (state) => state.sceneCache,
    events: (state) => state.eventCache,
    userSessions: (state) => state.userSessionCache,
    analyticsSessions: (state) => state.analyticsSessionCache,
  },
  mutations: {
    START(state) {
      state.processing = true;
    },
    STOP(state) {
      state.processing = false;
    },
    INITIALIZE(state) {
      state.initialized = true;
    },
    ADD_USERS(state, { users, page, pageSize }) {
      humanizeDateTimes(users);
      state.userCache = mergeSetId(state.userCache, users, "userId");
      state.userPage = page;
      state.userPageSize = pageSize;
    },
    CLEAR_USERS(state) {
      state.userCache.length = 0;
    },
    ADD_ORGS(state, { organizations, page, pageSize }) {
      humanizeDateTimes(organizations);
      state.orgCache = mergeSetId(state.orgCache, organizations, "orgId");
      state.orgPage = page;
      state.orgPageSize = pageSize;
    },
    CLEAR_ORGS(state) {
      state.orgCache.length = 0;
    },
    ADD_SCENES(state, { scenes, page, pageSize }) {
      humanizeDateTimes(scenes);
      state.sceneCache = mergeSetId(state.sceneCache, scenes, "sceneId");
      state.scenePage = page;
      state.scenePageSize = pageSize;
    },
    CLEAR_SCENES(state) {
      state.sceneCache.length = 0;
    },
    ADD_EVENTS(state, { events, page, pageSize }) {
      humanizeDateTimes(events);
      state.eventCache = mergeSetId(state.eventCache, events, "eventId");
      state.eventPage = page;
      state.eventPageSize = pageSize;
    },
    CLEAR_EVENTS(state) {
      state.eventCache.length = 0;
    },
    ADD_ANALYTICS_SESSIONS(state, { sessions, page, pageSize }) {
      humanizeDateTimes(sessions);
      state.analyticsSessionCache = mergeSetId(state.analyticsSessionCache, sessions, "sessionId");
      state.analyticsSessionPage = page;
      state.analyticsSessionPageSize = pageSize;
    },
    CLEAR_ANALYTICS_SESSIONS(state) {
      state.analyticsSessionCache.length = 0;
    },
    ADD_USER_SESSIONS(state, { sessions, page, pageSize }) {
      humanizeDateTimes(sessions);
      state.userSessionCache = mergeSetId(state.userSessionCache, sessions, "sessionId");
      state.userSessionPage = page;
      state.userSessionPageSize = pageSize;
    },
    CLEAR_USER_SESSIONS(state) {
      state.userSessionCache.length = 0;
    },
    CLEAR_CACHE(state) {
      state.processing = false;
      state.initialized = false;
      state.userCache.length = 0;
      state.orgCache.length = 0;
      state.sceneCache.length = 0;
      state.eventCache.length = 0;
      state.userSessionCache.length = 0;
    },
  },
  actions: {
    getAdminPanelKeys: async ({ commit, state }, force) => {
      const page = 0,
        pageSize = 100;

      if (force) {
        commit("CLEAR_CACHE");
      } else if (state.initialized) {
        return;
      }

      commit("START");
      const response = await getAdminPanelKeys(page, pageSize);
      const { users, organizations, scenes, events } = response;
      commit("INITIALIZE");
      if (users?.length) {
        commit("ADD_USERS", { users, page, pageSize });
      }
      if (organizations?.length) {
        commit("ADD_ORGS", { organizations, page, pageSize });
      }
      if (scenes?.length) {
        commit("ADD_SCENES", { scenes, page, pageSize });
      }
      if (events?.length) {
        commit("ADD_EVENTS", { events, page, pageSize });
      }
      commit("STOP");
    },
    getUsers: async ({ commit }, page, pageSize, sort) => {
      if (page == 1) {
        commit("clearUsers");
      }
      commit("START");
      const users = await getUsers(page, pageSize, sort);
      commit("ADD_USERS", { users, page, pageSize });
      commit("STOP");
    },
    getOrganizations: async ({ commit }, page, pageSize, sort) => {
      if (page == 1) {
        commit("clearOrganizations");
      }
      commit("START");
      const organizations = await getOrganizations(page, pageSize, sort);
      commit("ADD_ORGS", organizations);
      commit("STOP");
    },
    getScenes: async ({ commit }, page, pageSize, sort) => {
      if (page == 1) {
        commit("CLEAR_SCENES");
      }
      commit("START");
      const scenes = await getScenes(page, pageSize, sort);
      commit("ADD_SCENES", scenes);
      commit("STOP");
    },
  },
};
