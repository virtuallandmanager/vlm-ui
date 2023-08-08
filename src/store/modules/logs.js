import * as logDal from "../dal/logs";
export default {
  namespaced: true,
  state: () => ({}),
  mutations: {},
  actions: {
    logError: ({ rootGetters }, { log, metadata }) => {
      const payload = {
        userInfo: rootGetters["user/userInfo"],
        log,
        metadata,
      };

      logDal.logError(log, metadata, payload);
    },
    logWarning: ({ rootGetters }, { log, metadata }) => {
      const payload = {
        userInfo: rootGetters["user/userInfo"],
        log,
        metadata,
      };

      logDal.logWarning(log, metadata, payload);
    },
    logInfo: ({ rootGetters }, { log, metadata }) => {
      const payload = {
        userInfo: rootGetters["user/userInfo"],
        log,
        metadata,
      };

      logDal.logInfo(log, metadata, payload);
    },
    logWAT: ({ rootGetters }, { log, metadata }) => {
      const payload = {
        userInfo: rootGetters["user/userInfo"],
        log,
        metadata,
      };

      logDal.logWAT(log, metadata, payload);
    },
  },
};
