module.exports = {
  transpileDependencies: ["vuetify", "vue-tel-input-vuetify"],
  productionSourceMap: false,
  configureWebpack: {
    optimization: {
      minimize: true,
    },
  },
};
