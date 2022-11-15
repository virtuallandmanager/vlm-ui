import colors from "vuetify/lib/util/colors";

export default {
  primary: {
    base: colors.purple.lighten2,
    darken1: colors.purple.darken2,
    button: colors.purple.accent1
  },
  secondary: colors.indigo,
  // All keys will generate theme styles,
  // Here we add a custom `tertiary` color
  tertiary: colors.pink.base,
  nav: colors.purple.lighten2,
  accenttext: colors.purple.lighten2,
  development: colors.pink.lighten1,
  staging: colors.indigo.darken4,
  production: colors.black
};
