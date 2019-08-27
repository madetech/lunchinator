<template>
  <v-container fluid>
    <LunchCycleWeekNav
      class="d-inline-flex pa-2"
      :restaurants="restaurants"
      v-on:changeDate="changeDate"
    ></LunchCycleWeekNav>
    <LunchCycleWeek
      class="d-inline-flex pa-2"
      :selectedDate="selectedDate"
      :allLunchers="allLunchers"
      :nonResponders="nonResponders"
      v-on:removeLuncher="removeLuncher"
      v-on:addLuncher="addLuncher"
      v-on:saveLunchers="saveLunchers"
    ></LunchCycleWeek>
  </v-container>
</template>

<script>
import axios from "axios";
import LunchCycleWeek from "./LunchCycleWeek.vue";
import LunchCycleWeekNav from "./LunchCycleWeekNav.vue";

export default {
  name: "Draw",
  components: {
    LunchCycleWeek,
    LunchCycleWeekNav
  },
  data() {
    return {
      restaurants: null,
      selectedDate: null,
      allLunchers: null,
      nonResponders: null
    };
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      let response = await axios.get(`${process.env.VUE_APP_API_URL}/currentdraw`, {
        headers: {
          Authorization: "Basic " + this.$token
        }
      });
      this.drawdata = response.data;
      this.restaurants = response.data.map(x => x.restaurant);

      if (!this.selectedDate) {
        this.selectedDate = response.data[0];
      }

      response = await axios.get(`${process.env.VUE_APP_API_URL}/alllunchers`, {
        headers: {
          Authorization: "Basic " + this.$token
        }
      });

      this.allLunchers = response.data;
      const responderIds = this.drawdata
        .map(x => x.lunchers)
        .flat()
        .map(x => x.slackUserId);

      this.nonResponders = this.allLunchers.filter(l => !responderIds.includes(l.id));
    },
    changeDate(date) {
      this.selectedDate = this.drawdata.filter(x => x.restaurant.date === date)[0];
    },
    removeLuncher(slackUserId) {
      this.selectedDate.lunchers = this.selectedDate.lunchers.filter(
        l => l.slackUserId !== slackUserId
      );
    },
    addLuncher(luncher) {
      const slackUserIds = this.selectedDate.lunchers.map(x => x.slackUserId);
      if (!slackUserIds.includes(luncher.slackUserId)) {
        this.selectedDate.lunchers.push(luncher);
      }
    },
    async saveLunchers() {
      await axios.post(`${process.env.VUE_APP_API_URL}/update`, this.drawdata, {
        headers: {
          Authorization: "Basic " + this.$token
        }
      });
      await this.loadData();
    }
  }
};
</script>