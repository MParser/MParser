import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import 'element-plus/theme-chalk/dark/css-vars.css' //夜间模式主题
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import "./mock/index.js";
import router from "./router";


const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(pinia)
  .use(ElementPlus, {locale: "zh-cn"})
  .use(router)
  .mount("#app");
