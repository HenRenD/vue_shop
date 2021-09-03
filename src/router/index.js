import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from "../components/Login.vue"
import Home from "../components/Home.vue"

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
    component: Home
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, form, next) => {
  if (to.path === "/login") return next();
  const token = sessionStorage.getItem("token");
  // 判断router身上的token的值和本地存储的token的值是否相等，避免了修改token值，仍然可以登录的问题
  if (router.token !== token) return next("/login");
  next();
})

export default router
