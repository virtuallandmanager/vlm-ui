import Vue from "vue";
import Vuetify from "vuetify/lib/framework";
import dark from "../../themes/vlm.js"
Vue.use(Vuetify);

import colors from "vuetify/lib/util/colors";

export default new Vuetify({
  theme: {
    dark: true,
    themes: {
      light: {
        primary: colors.shades.black,
        secondary: colors.red.darken1,
        accent: colors.shades.black,
        error: colors.red.accent3,
      },
      dark
    },
  },
});
