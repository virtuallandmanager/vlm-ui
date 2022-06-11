import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import store from "./store";
import processString from "./helpers/processString";

Vue.config.productionTip = false;

new Vue({
  router,
  vuetify,
  store,
  processString,
  render: (h) => h(App),
}).$mount("#app");
