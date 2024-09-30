import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import store from './store'
import processString from './helpers/processString'
import VueTelInputVuetify from 'vue-tel-input-vuetify/lib'
import 'flag-icon-css/css/flag-icons.min.css'

Vue.config.productionTip = false

Vue.use(VueTelInputVuetify, {
  vuetify,
})

new Vue({
  router,
  vuetify,
  store,
  processString,
  render: (h) => h(App),
}).$mount('#app')
