import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 引入全局样式表
import './assets/css/global.css'
// 引入第三方字体图标
import './assets/fonts/iconfont.css'
// 配置axios
import axios from "axios"
// 引入树列表
import treeTable from 'vue-table-with-tree-grid'
// 设置请求的根路径
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/"
// 为axios添加请求拦截器
axios.interceptors.request.use((config) => {
  config.headers.Authorization = sessionStorage.getItem("token")
  return config
})
// 将axios挂在到vue的原型上
Vue.prototype.$http = axios
Vue.component("tree-table", treeTable)
// 关闭生产提示
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
