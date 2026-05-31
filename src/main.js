import { createApp } from 'vue'
import App from './App.vue'
import { i18n } from "@/i18n.js";
import router from '@/router';
import './assets/css/main.css';
import { createPinia } from 'pinia';
import { useAuthStore } from "@/stores/auth.js";

const app = createApp(App)
const pinia = createPinia()

app.use(i18n)
app.use(pinia)
app.use(router)

const auth = useAuthStore()
await auth.loadUserFromStorage()
app.mount('#app')
