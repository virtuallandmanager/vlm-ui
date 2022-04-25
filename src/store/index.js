import Vue from "vue";
import Vuex from "vuex";
import login from "./login";
import land from "./land";
import image from "./image";

Vue.use(Vuex);

export default new Vuex.Store({
  // state: {
  //   ...login.state
  // },
  // mutations: {
  //   ...login.mutations
  // },
  // actions: {
  //   ...login.actions
  // },

  modules: { login, land, image },
});
