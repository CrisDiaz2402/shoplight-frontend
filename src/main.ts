import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import Toast from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
// Register toast plugin globally with 3s default timeout
app.use(Toast, { autoClose: 3000 })
app.mount('#app')
