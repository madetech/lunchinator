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
      <v-subheader>{{header}}</v-subheader>
      <v-list-item-group color="primary">
        <v-list-item v-for="item in items" :key="item.slackUserId">
          <v-list-item-avatar v-if="avatar">
            <v-img :src="item.avatar"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title v-html="item.firstName"></v-list-item-title>
            <v-list-item-subtitle v-if="twoLine || threeLine" v-html="item.email"></v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-icon v-if="canEdit">
            <v-btn max-width="15" v-on:click="emitRemoveLuncher(item.slackUserId)">X</v-btn>
          </v-list-item-icon>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-card>
</template>

<script>
export default {
  name: "LuncherList",
  props: {
    lunchers: {
      type: Array,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    editable: {
      type: Boolean,
      required: false
    }
  },
  watch: {
    lunchers: {
      deep: true,
      handler() {
        this.header = this.title;
        this.items = this.lunchers;
        this.canEdit = this.editable;
      }
    }
  },
  data: () => ({
    header: null,
    items: null,
    canEdit: false,

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
    avatar: false,
    rounded: false
  }),
  methods: {
    emitRemoveLuncher(slackUserId) {
      this.$emit("removeLuncher", slackUserId);
    }
  }
};
</script>