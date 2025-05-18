// import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue';
import stores from './stores';
import router from './router';
import 'virtual:uno.css';
import 'element-plus/theme-chalk/el-notification.css';

const app = createApp(App)

app.use(stores)
app.use(router)

import { appConfig } from './core/config';
document.title = appConfig.title;

app.mount('#app')
