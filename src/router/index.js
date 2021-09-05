import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from "../components/Login.vue"
import Home from "../components/Home.vue"
import Welcome from "../components/Welcome.vue"
import Users from "../components/users/Users"
import Rights from "../components/power/Rights"
import Roles from "../components/power/Roles"
import Cate from "../components/goods/Cate"
import Params from "../components/goods/Params"
import List from "../components/goods/List"
import Add from "../components/goods/Add"
import Order from "../components/order/Order"
import Report from "../components/report/Report"

Vue.use(VueRouter)

const routes = [
  {
    path: "/",
    redirect: "/login"
  },
  {
    path: "/login",
    component: Login
  },
  {
    path: "/home",
    component: Home,
    redirect: "/welcome",
    children: [
      {
        path: "/welcome",
        component: Welcome
      },
      {
        path: "/users",
        component: Users
      },
      {
        path: "/rights",
        component: Rights
      },
      {
        path: "/roles",
        component: Roles
      },
      {
        path: '/categories',
        component: Cate
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: "/goods",
        component: List,
      },
      {
        path: "/goods/add",
        component: Add
      },
      {
        path: "/orders",
        component:Order
      },
      {
        path: "/reports",
        component:Report
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, form, next) => {
  if (to.path === "/login") return next();
  const token = sessionStorage.getItem("token");
  // 判断router身上的token的值和本地存储的token的值是否相等，避免了修改token值，仍然可以登录的问题
  // console.log(router.token,token)
  if (!token) return next("/login");
  next();
})

export default router
