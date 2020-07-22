module.exports = {
  transpileDependencies: ["vuetify"],
  css: {
    loaderOptions: {
      sass: {
        data: `@import "~@/sass/main.scss"`
      },
      scss: {
        data: `@import "~@/sass/main.scss";`
      }
    }
  }
};
