<template>
  <v-card>
    <v-list
      :disabled="disabled"
      :dense="dense"
      :two-line="twoLine"
      :three-line="threeLine"
      :shaped="shaped"
      :flat="flat"
      :subheader="subheader"
      :inactive="inactive"
      :sub-group="subGroup"
      :nav="nav"
      :avatar="avatar"
      :rounded="rounded"
    >
      <v-subheader>LUNCH DATES</v-subheader>
      <v-list-item-group color="primary">
        <v-list-item v-for="item in items" :key="item.date" v-on:click="emitDate(item.date)">
          <v-list-item-content>
            <v-list-item-title>{{ item.date }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-card>
</template>

<script>
export default {
  name: "LunchCycleWeekNav",
  props: {
    restaurants: {
      type: Array,
      required: true
    }
  },
  watch: {
    restaurants: {
      deep: true,
      handler() {
        this.items = this.restaurants;
      }
    }
  },
  data() {
    return {
      items: null,

      disabled: false,
      dense: true,
      twoLine: true,
      threeLine: false,
      shaped: false,
      flat: false,
      subheader: false,
      inactive: false,
      subGroup: false,
      nav: true,
      avatar: true,
      rounded: false
    };
  },
  methods: {
    emitDate(date) {
      this.$emit("changeDate", date);
    }
  }
};
</script>