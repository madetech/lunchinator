<template>
  <v-app>
    <v-app-bar app>
      Lunchinator
      <v-switch :inset="true" :error="error" :success="success"></v-switch>
    </v-app-bar>
    <!-- Sizes your content based upon application components -->
    <v-content>
      <!-- Provides the application the proper gutter -->
      <v-container v-if="isLoading" fluid>
        <LunchCycleWeekNav :drawdata="drawdata"></LunchCycleWeekNav>
        <LuncherList></LuncherList>
        <LuncherList></LuncherList>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import axios from "axios";
import LuncherList from "./LuncherList.vue";
import LunchCycleWeekNav from "./LunchCycleWeekNav.vue";

export default {
  name: "LunchinatorMain",
  components: {
    LuncherList,
    LunchCycleWeekNav
  },
  data() {
    return {
      isLoading: true,
      drawdata: null
    };
  },
  mounted() {
    axios.get("http://localhost:4390/currentdraw?token=tokentokentoken").then(response => {
      this.isLoading = true;
      this.drawdata = response.data.map(x => x.restaurant);
    });
  }
};
</script>