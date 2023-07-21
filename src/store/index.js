import Vue from "vue";
import Vuex from "vuex";
import app from "./modules/app";
import admin from "./modules/admin";
import auth from "./modules/auth";
import banner from "./modules/banner";
import dialog from "./modules/dialog";
import event from "./modules/event";
import image from "./modules/image";
import scene from "./modules/scene";
import moderation from "./modules/moderation";
import organization from "./modules/organization";
import user from "./modules/user";
import video from "./modules/video";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: { app, admin, auth, banner, dialog, event, image, scene, moderation, organization, user, video },
});
