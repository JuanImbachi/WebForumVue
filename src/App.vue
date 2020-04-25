<template>
  <v-app id="app">
    <Toolbar></Toolbar>
    <router-view></router-view>
  </v-app>
</template>

<script>
import { mapGetters } from "vuex";
import Toolbar from "./components/ToolBar";

export default {
  name: 'WebForumVue',
  computed: {
    ...mapGetters(
    {
      user: "user"
    })
  },
  components: {
    Toolbar
  }
}
</script>

<style>
body{
   background-color: white;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: white;
}
</style>
