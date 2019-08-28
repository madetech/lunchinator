<template>
  <v-container fluid>
    <v-card>
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
          return { text: `${x.name} (${x.date})`, value: x.emoji };
        })
      );

      response = await axios.get(`${process.env.VUE_APP_API_URL}/alllunchers`, {
        headers: {
          Authorization: "Basic " + this.$token
        }
      });

      // would be nice to move this into server-side
      this.allLunchers = response.data.map(user => {
        const item = {
          name: `${user.profile.first_name} (${user.profile.email})`
        };

        const luncher = this.availabilities.filter(l => l.slackUserId === user.id)[0];
        if (luncher) {
          luncher.availableEmojis.forEach(e => {
            item[e] = "\u2714";
          });
          item.isNonResponder = luncher.availableEmojis.length === 0;
        }

        return item;
      });

      this.nonResponders = this.allLunchers.filter(x => x.isNonResponder);
      this.items = this.allLunchers;
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
      items: []
    };
  }
};
</script>