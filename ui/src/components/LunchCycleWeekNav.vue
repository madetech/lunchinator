<template>
  <v-card elevation="12" width="256">
    <v-navigation-drawer floating permanent>
      <v-list dense rounded>
        <v-list-item v-for="item in items" :key="item.date" link>
          <v-list-item-content>
            <v-list-item-title>{{ item.date }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-card>
</template>

<script>
export default {
  name: "LunchCycleWeekNav",
  props: {
    drawdata: {
      type: Array,
      required: true
    }
  },
  watch: {
    drawdata: {
      deep: true,
      handler() {
        this.items = this.drawdata;
      }
    }
  },
  data() {
    return {
      items: this.drawdata
    };
  }
};
</script>