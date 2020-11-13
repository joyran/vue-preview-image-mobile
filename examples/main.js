import Vue from 'vue'
import App from './App.vue'
import PreviewImage from 'packages/index.js'

Vue.config.productionTip = false
Vue.use(PreviewImage)

new Vue({
  render: h => h(App)
}).$mount('#app')
