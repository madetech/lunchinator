import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";

Vue.config.productionTip = false;

let globals = new Vue({
  data: {
    $isAuthenticated: false,
    $token: ""
  }
});

Vue.mixin({
  computed: {
    $isAuthenticated: {
      get: function() {
        return globals.$data.$isAuthenticated;
      },
      set: function(value) {
        globals.$data.$isAuthenticated = value;
      }
    },
    $token: {
      get: function() {
        return globals.$data.$token;
      },
      set: function(value) {
        globals.$data.$token = value;
      }
    }
  }
});

new Vue({
  vuetify,
  render: h => h(App)
}).$mount("#app");
