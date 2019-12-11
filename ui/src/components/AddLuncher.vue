<template>
  <v-toolbar>
    <v-autocomplete
      v-model="select"
      :items="items"
      :search-input.sync="search"
      hide-no-data
      class
      flat
      clearable
      hide-details
      hide-selected
      label="search for a luncher..."
      solo
    ></v-autocomplete>
    <v-spacer></v-spacer>
    <v-btn class="mr-2" v-on:click="clear">Clear</v-btn>
    <v-btn class="mr-2" v-on:click="add">Add Luncher</v-btn>
    <v-btn class="mr-2" v-on:click="save" :loading="saving">Save All</v-btn>
  </v-toolbar>
</template>

<script>
export default {
  name: "AddLuncher",
  props: {
    lunchers: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      saving: false,
      items: [],
      search: null,
      select: null,
      luncherItems: []
    };
  },
  watch: {
    search(val) {
      val && val !== this.select && this.querySelections(val);
    },
    lunchers: {
      deep: true,
      handler() {
        this.luncherItems = this.lunchers.map(l => {
          return {
            text: `${l.profile.real_name} - (${l.profile.email})`,
            value: {
              firstName: l.profile.real_name,
              email: l.profile.email,
              slackUserId: l.id
            }
          };
        });
      }
    }
  },
  methods: {
    querySelections(v) {
      this.items = this.luncherItems.filter(e => {
        return (e.text || "").toLowerCase().indexOf((v || "").toLowerCase()) > -1;
      });
    },
    clear() {
      this.select = null;
    },
    add() {
      this.$emit("addLuncher", this.select);
      this.select = null;
    },
    save() {
      this.saving = true;
      setTimeout(() => {
        this.saving = false;
      }, 2000);
      this.$emit("saveLunchers");
    }
  }
};
</script>
