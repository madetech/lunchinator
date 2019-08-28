<template>
  <v-content>
    <v-tabs right grow background-color="white">
      <v-tab>Latest Availabilities</v-tab>
      <v-tab>Current Draw</v-tab>
      <v-tab-item>
        <Availabilities></Availabilities>
      </v-tab-item>
      <v-tab-item>
        <Draw></Draw>
      </v-tab-item>
    </v-tabs>
  </v-content>
</template>

<script>
import Draw from "./Draw.vue";
import Availabilities from "./Availabilities";

export default {
  name: "Main",
  components: {
    Draw,
    Availabilities
  }
};
</script>