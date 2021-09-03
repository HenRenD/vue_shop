import Vue from 'vue'
import { Button } from 'element-ui'
import { Form, FormItem, Input } from 'element-ui'
// 导入弹窗消息提示
import { Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)

// 将弹窗消息提示组件挂在Vue的原型上
Vue.prototype.$message = Message
