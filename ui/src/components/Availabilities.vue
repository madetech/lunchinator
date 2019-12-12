<template>
  <v-container fluid>
    <div class="text-center" v-if="loading">
      <v-progress-circular :size="70" :width="8" color="primary" indeterminate></v-progress-circular>
    </div>
    <v-card v-if="!loading">
      <v-card-title>
        <v-text-field v-model="search" label="filter" single-line hide-details></v-text-field>
        <v-switch @change="showNonResponders" label="Show Non-Responders" class="pa-3"></v-switch>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="items"
        class="elevation-1"
        :search="search"
        disable-pagination
        hide-default-footer
        dense
      ></v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "Availabilities",
  async mounted() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      let response = await axios.get(`${process.env.VUE_APP_API_URL}/currentavailabilities`, {
        headers: {
          Authorization: "Basic " + this.$token
        }
      });

      this.lunchCycle = response.data.lunchCycle;
      this.availabilities = response.data.availabilities;

      this.headers = [
        {
          text: "",
          value: "name"
        }
      ].concat(
        this.lunchCycle.restaurants.map(x => {
          return { text: `${x.name} (${x.date})`, value: x.name };
        })
      );

      response = await axios.get(`${process.env.VUE_APP_API_URL}/alllunchers`, {
        headers: {
          Authorization: "Basic " + this.$token
        }
      });

      const checkMark = "\u2714"
      const xMark = "\u2716"
      this.allLunchers = response.data.map(user => {
        const item = {
          name: `${user.profile.real_name} (${user.profile.email})`
        };

        const luncherAvailability = this.availabilities.filter(l => l.slackUserId === user.id);
        luncherAvailability.forEach(response => {
          if (response.available === true) {
            item[response.restaurantName] = checkMark
          } else {
            item[response.restaurantName] = xMark
          }
        })
        item.isNonResponder = luncherAvailability.length === 0;

        return item;
      });

      this.nonResponders = this.allLunchers.filter(x => x.isNonResponder);
      this.items = this.allLunchers;
      this.loading = false;
    },
    showNonResponders(value) {
      if (value) {
        this.items = this.nonResponders;
      } else {
        this.items = this.allLunchers;
      }
    }
  },
  data() {
    return {
      search: "",
      headers: [],
      items: [],
      loading: false
    };
  }
};
</script>