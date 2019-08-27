<template>
  <div id="app">
    <Login v-if="!$isAuthenticated"></Login>
    <Main v-if="$isAuthenticated"></Main>
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
