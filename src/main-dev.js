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
// 引入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 富文本编辑器的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
// 引入nprogress的js文件和css文件
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 设置请求的根路径
axios.defaults.baseURL = "http://43.129.200.251:8889/api/private/v1/"
// 在请求拦截器中开启进度条，nprogress
// 为axios添加请求拦截器
axios.interceptors.request.use((config) => {
  NProgress.start()
  config.headers.Authorization = sessionStorage.getItem("token")
  return config
})
// 在响应拦截器中关闭进度条 nprogress
axios.interceptors.response.use((config) => {
  NProgress.done()
  return config
})
// 将axios挂在到vue的原型上
Vue.prototype.$http = axios
Vue.component("tree-table", treeTable)
// 关闭生产提示
Vue.config.productionTip = false
// 使用富文本编辑器
Vue.use(VueQuillEditor)
// 时间过滤器
Vue.filter("dateFormat", function (value) {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1 + '').padStart(2,'0')
  const day = (date.getDate() + '').padStart(2, '0')
  
  const hour = (date.getHours() + '').padStart(2,'0')
  const minutes = (date.getMinutes() + '').padStart(2,'0')
  const second = (date.getSeconds() + '').padStart(2, '0')
  
  return `${year}-${month}-${day} ${hour}:${minutes}:${second}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
