import Vue from "vue";
import Vuex from "vuex";
import auth from "./modules/auth";
import land from "./modules/land";
import image from "./modules/image";
import moderation from "./modules/moderation";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: { auth, land, image, moderation },

});
