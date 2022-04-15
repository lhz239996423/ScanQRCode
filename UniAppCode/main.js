import Vue from 'vue'
import App from './App'
import config from './config/index.js'

Vue.config.productionTip = false

App.mpType = 'app'
Vue.prototype.$config = config

const app = new Vue({
    ...App
})
app.$mount()
