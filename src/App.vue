<template>
  <div id="app">
    <Toolbar @showStatus="showStatus"></Toolbar>
    <v-alert
    v-if="status != null"
    :type="status.type"
    outlined
    text
    :icon="status.icon"
    transition="scale-transition"
    >{{status.message}}</v-alert>
    <router-view></router-view>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Toolbar from "./components/ToolBar";

export default {
  name: 'App',
  data(){
    return{
       status: null
    }
  },
  computed: {
    ...mapGetters(
    {
      user: "user"
    })
  },
  methods: {
    showStatus(status)
    {
      this.status = status
      setTimeout(() => {this.status = null}, 3000);
    }
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
