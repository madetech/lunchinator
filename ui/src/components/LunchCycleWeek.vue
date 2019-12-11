<template>
  <v-container class="d-flex flex-column">
    <v-container>
      <v-card>
        <v-card-title>{{title}}</v-card-title>
      </v-card>
    </v-container>

    <v-container>
      <AddLuncher
        :lunchers="allLuncherss"
        v-on:addLuncher="addLuncher"
        v-on:saveLunchers="saveLunchers"
      ></AddLuncher>
    </v-container>

    <v-container class="d-inline-flex">
      <LuncherList
        class="pa-1 mr-2"
        :lunchers="luncherss"
        :title="'SELECTED LUNCHERS'"
        :editable="true"
        v-on:removeLuncher="removeLuncher"
      ></LuncherList>
      <LuncherList class="pa-1 mr-2" :lunchers="allAvaill" :title="'AVAILABLE LUNCHERS'"></LuncherList>
      <LuncherList class="pa-1" :lunchers="nons" :title="'NOT GOING ANYWHERE'"></LuncherList>
    </v-container>
  </v-container>
</template>

<script>
import LuncherList from "./LuncherList.vue";
import AddLuncher from "./AddLuncher.vue";

export default {
  name: "LunchCycleWeek",
  components: {
    LuncherList,
    AddLuncher
  },
  props: {
    selectedDate: {
      type: Object,
      required: true
    },
    allLunchers: {
      type: Array,
      required: true
    },
    nonResponders: {
      type: Array,
      required: true
    }
  },
  watch: {
    selectedDate: {
      deep: true,
      handler() {
        this.luncherss = this.selectedDate.lunchers;
        this.allAvaill = this.selectedDate.allAvailable;
        this.title = `${this.selectedDate.restaurant.name} - ${this.selectedDate.restaurant.date}`;
      }
    },
    allLunchers: {
      deep: true,
      handler() {
        this.allLuncherss = this.allLunchers;
      }
    },
    nonResponders: {
      deep: true,
      handler() {
        this.nons = this.nonResponders.map(l => {
          return {
            firstName: l.profile.real_name,
            email: l.profile.email,
            slackUserId: l.id
          };
        });
      }
    }
  },
  data: () => ({
    luncherss: null,
    allAvaill: null,
    title: null,
    allLuncherss: null,
    nons: null
  }),
  methods: {
    removeLuncher(slackUserId) {
      this.$emit("removeLuncher", slackUserId);
    },
    addLuncher(luncher) {
      this.$emit("addLuncher", luncher);
    },
    saveLunchers() {
      this.$emit("saveLunchers");
    }
  }
};
</script>