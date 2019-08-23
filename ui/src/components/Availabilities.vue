<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        <v-text-field v-model="search" label="filter" single-line hide-details></v-text-field>
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
      let response = await axios.get(
        `${process.env.VUE_APP_LUNCH_CYCLE_API}/currentavailabilities?token=${process.env.VUE_APP_LUNCH_CYCLE_API_TOKEN}`
      );

      this.lunchCycle = response.data.lunchCycle;
      this.availabilities = response.data.availabilities;

      this.headers = [
        {
          text: "",
          value: "name"
        }
      ].concat(
        this.lunchCycle.restaurants.map(x => {
          return { text: `${x.name} (${x.date})`, value: x.emoji };
        })
      );

      response = await axios.get(
        `${process.env.VUE_APP_LUNCH_CYCLE_API}/alllunchers?token=${process.env.VUE_APP_LUNCH_CYCLE_API_TOKEN}`
      );

      this.items = response.data.map(user => {
        const item = {
          name: `${user.profile.first_name} (${user.profile.email})`
        };

        const luncher = this.availabilities.filter(l => l.slackUserId === user.id)[0];
        if (luncher) {
          luncher.availableEmojis.forEach(e => {
            item[e] = "\u2714";
          });
        }

        return item;
      });
    }
  },
  data() {
    return {
      search: "",
      headers: [],
      items: []
    };
  }
};
</script>