import Vue from 'vue';
import Router from 'vue-router'
import Users from '../Views/Users.vue'
import Forums from '../Views/Forums.vue'
import Forum from '../components/Forum.vue'
import LogInForm from '../Views/LogInForm.vue'
import SignUpForm from '../Views/SignUpForm.vue'
import UpdateAccount from '../Views/UpdateAccount.vue'


Vue.use(Router);

export default new Router({
  mode : 'history',
  routes: 
  [
    {path: "/", redirect: "/forums"},
    {path: "/users",            name: 'users',  component: Users},
    {path: "/forums",           name: 'forums', component: Forums},
    {path: "/forums/forum/:id", name: 'forum',  component: Forum},
    {path: "/logIn",            name: 'logIn',  component: LogInForm},
    {path: "/signUp",           name: 'signUp', component: SignUpForm},
    {path: "/updateAccount",    name: 'updateAccount', component: UpdateAccount}
  ],
  linkActiveClass: 'active',
});
