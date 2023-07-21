export default {
  namespaced: true,
  state: () => ({
    navDrawerOpen: false,
    demoMode: false,
    showNav: true,
  }),
  getters: {
    navDrawerOpen: (state) => state.navDrawerOpen,
    demoMode: (state) => state.demoMode,
    showNav: (state) => state.showNav,
  },
  mutations: {
    SET_DRAWER_STATE(state, isOpen) {
      state.navDrawerOpen = isOpen;
    },
    SET_DEMO_STATE(state, demo) {
      state.demoMode = demo;
    },
    SET_NAV_STATE(state, showNav) {
      state.showNav = showNav;
    },
  },
  actions: {
    toggleNavDrawer({ commit, state }) {
      try {
        commit("SET_DRAWER_STATE", !state.navDrawerOpen);
      } catch (error) {
        console.log(error);
      }
    },
    setNavDrawerState({ commit }, isOpen) {
      try {
        commit("SET_DRAWER_STATE", isOpen);
      } catch (error) {
        console.log(error);
      }
    },
    setDemoMode({ commit }, demo) {
      try {
        commit("SET_DEMO_STATE", demo);
      } catch (error) {
        console.log(error);
      }
    },
    setNavState({ commit }, showNav) {
      try {
        commit("SET_NAV_STATE", showNav);
      } catch (error) {
        console.log(error);
      }
    },
  },
};
