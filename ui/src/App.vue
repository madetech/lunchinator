<template>
  <div id="app">
    <v-app>
      <v-app-bar src="./assets/spaghetti.jpeg" app>LUNCHINATOR</v-app-bar>
      <Login v-if="!$isAuthenticated"></Login>
      <Main v-if="$isAuthenticated"></Main>
    </v-app>
  </div>
</template>

<script>
import Main from "./components/Main.vue";
import Login from "./components/Login.vue";

export default {
  name: "app",
  components: {
    Main,
    Login
  }
};
</script>
