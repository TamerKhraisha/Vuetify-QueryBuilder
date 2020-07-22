import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import router from "./router";

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount("#app");
