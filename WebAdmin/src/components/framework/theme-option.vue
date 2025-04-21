<script setup>
import DarkIcon from "../../assets/icons/icon-Dark.vue";
import LightIcon from "../../assets/icons/icon-Light.vue";
import { themeStore } from "../../store/sys/theme.js";
const theme = themeStore();
// 定义 prop，设置 placement 的默认值
defineProps({
  tipPlacement: {
    type: String,
    default: "top",
  },
});
</script>

<template>
  <el-tooltip content="切换主题" :placement="tipPlacement">
    <el-switch
        v-model="theme.isDark"
        @change="theme.toggleTheme()"
        :active-action-icon="DarkIcon"
        :inactive-action-icon="LightIcon"
    />
  </el-tooltip>
</template>

<style scoped>
</style>
