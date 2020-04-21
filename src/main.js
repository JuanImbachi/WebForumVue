import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import vuetify from './plugins/vuetify'
import store from './config/store'
import router from './routes/starterRouter'

Vue.config.productionTip = false

Vue.use(VueRouter)

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App),
}).$mount('#app')
