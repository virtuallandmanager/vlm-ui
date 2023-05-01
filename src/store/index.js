import Vue from "vue";
import Vuex from "vuex";
import auth from "./modules/auth";
import image from "./modules/image";
import scene from "./modules/scene";
import moderation from "./modules/moderation";
import organization from "./modules/organization";
import user from "./modules/user";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: { auth, image, scene, moderation, organization, user },
});
