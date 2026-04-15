import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Toast, {
  position: 'bottom-right',   // góc phải dưới
  timeout: 3000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
  maxToasts: 3,
  toastClassName: 'library-toast',
})

app.mount('#app')