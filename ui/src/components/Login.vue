<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field label="Password" v-model="password" type="password" required></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-2" large block v-on:click="login">LOGIN</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import axios from "axios";

export default {
  name: "Login",
  data: () => ({
    dialog: true
  }),
  methods: {
    async login() {
      const encodedPassword = btoa(this.password);
      axios
        .post(`${process.env.VUE_APP_API_URL}/login`, null, {
          headers: {
            Authorization: "Basic " + encodedPassword
          }
        })
        .then(response => {
          this.$token = response.data.token;
          this.$isAuthenticated = true;
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
};
</script>
