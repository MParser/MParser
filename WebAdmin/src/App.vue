<template>
  <el-config-provider :locale="locale">
    <Load v-if="isLoad" />
    <Frame v-else-if="user.isLogin" />
    <Login v-else />
  </el-config-provider>
</template>

<script setup>
import { VerifyLogin } from "@/apis/sys/user.js";
import { tabStore } from "@/store/sys/tabs.js";
import { userStore } from "@/store/sys/user.js";
import Frame from "@/views/Frame.vue";
import Load from "@/views/sys/Load.vue";
import Login from "@/views/sys/Login.vue";
import { onMounted, onUnmounted, ref, watch } from "vue";
import locale from "element-plus/es/locale/lang/zh-cn";

import { useRouter } from "vue-router";

const router = useRouter();
const user = userStore();
const isLoad = ref(true);

// 监听登录状态变化
watch(
  () => user.isLogin,
  (newValue) => {
    if (!newValue) {
      // 未登录时清除所有标签页并跳转到登录页
      const tabs = tabStore();
      tabs.clean();
      router.push("/login");
    } else if (router.currentRoute.value.path === "/login") {
      // 登录成功后跳转到首页
      router.push("/home");
    }
  }
);

let checkInterval;

onMounted(async () => {
  isLoad.value = true;
  await VerifyLogin();

  if (!user.isLogin) {
    router.push("/login");
  } else if (router.currentRoute.value.path === "/login") {
    router.push("/home");
  }
  isLoad.value = false;

  // 每5分钟检查一次登录状态
  checkInterval = setInterval(async () => {
    await VerifyLogin();
  }, 5 * 60 * 1000);
});

onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval);
  }
});
</script>

<style>
/* 全局样式 */
@import "styles/App.css";
</style>
