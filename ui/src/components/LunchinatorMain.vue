<template>
  <v-app>
    <v-app-bar
      src="https://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fcdn-image.foodandwine.com%2Fsites%2Fdefault%2Ffiles%2Fstyles%2F4_3_horizontal_-_1200x900%2Fpublic%2F.%2Ffwx-man-eating-fast.jpg%3Fitok%3DSGFUqNUG"
      app
    >LUNCHINATOR</v-app-bar>
    <!-- Sizes your content based upon application components -->
    <v-content>
      <!-- Provides the application the proper gutter -->
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
    </v-content>
  </v-app>
</template>

<script>
import axios from "axios";
import LunchCycleWeek from "./LunchCycleWeek.vue";
import LunchCycleWeekNav from "./LunchCycleWeekNav.vue";

export default {
  name: "LunchinatorMain",
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
      let response = await axios.get(
        `${process.env.VUE_APP_LUNCH_CYCLE_API}/currentdraw?token=${process.env.VUE_APP_LUNCH_CYCLE_API_TOKEN}`
      );
      this.drawdata = response.data;
      this.restaurants = response.data.map(x => x.restaurant);

      if (!this.selectedDate) {
        this.selectedDate = response.data[0];
      }

      response = await axios.get(
        `${process.env.VUE_APP_LUNCH_CYCLE_API}/alllunchers?token=${process.env.VUE_APP_LUNCH_CYCLE_API_TOKEN}`
      );
      this.allLunchers = response.data;

      const availableIds = this.drawdata.map(x => x.allAvailable).flat();
      const luncherIds = this.drawdata.map(x => x.lunchers).flat();
      const responderIds = availableIds.concat(luncherIds).map(x => x.slackUserId);

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
      await axios.post(
        `${process.env.VUE_APP_LUNCH_CYCLE_API}/update?token=${process.env.VUE_APP_LUNCH_CYCLE_API_TOKEN}`,
        this.drawdata
      );
      await this.loadData();
    }
  }
};
</script>