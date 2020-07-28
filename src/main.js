import Vue from 'vue'
import App from './App.vue'
import router from './router'
import $ from 'jquery'
import store from './store'
import 'assets/css/index.scss'
import CanvasNest from 'canvas-nest.js'

// 设置 js中可以访问 $cdn
// 引入cdn
import { $cdn } from '@/config/config'
Vue.prototype.$cdn = $cdn
Vue.prototype.CanvasNest = CanvasNest
let config= {
    zIndex: 99,
    opacity: 1,
    color: '255,0,0',
    pointColor: '255,155,0',
    count: 200,
}

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
    mounted() {
        let cn = new CanvasNest(this.$el, config);
    }
}).$mount('#app')
