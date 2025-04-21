<!--suppress CssUnusedSymbol -->
<script setup>
import { Logout } from "@/apis/sys/user";
import { userStore } from "@/store/sys/user";
import { icons } from "@/utils/icons.js";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { computed } from "vue";
import { useRouter } from "vue-router";
const user = userStore();
const router = useRouter();

const userInfo = computed(() => user.userInfo);

const avatarSrc = computed(
  () => userInfo.value.avatar || "/assets/images/user.svg"
);

const handleCommand = async (command) => {
  switch (command) {
    case "profile":
      router.push("/user");
      break;
    case "logout":
      NProgress.start();
      await Logout();
      NProgress.done();
      break;
  }
};
</script>

<template>
  <div class="dropdown-container">
    <el-popover
      :width="120"
      trigger="hover"
      placement="bottom-end"
      popper-class="user-menu-popover"
    >
      <template #reference>
        <div class="avatar-box" tabindex="0">
          <el-avatar class="avatarBtn" :src="avatarSrc">{{
            userInfo.username.charAt(0).toUpperCase()
          }}</el-avatar>
          <el-text type="primary">{{ userInfo.username }}</el-text>
        </div>
      </template>

      <div class="user-menu-list">
        <button class="menu-item" @click="handleCommand('profile')">
          <el-icon><component :is="icons['BiSolidUser']" /></el-icon>
          <span>个人中心</span>
        </button>

        <div class="divider"></div>
        <button class="menu-item" @click="handleCommand('logout')">
          <el-icon><component :is="icons['BiSolidLogOut']" /></el-icon>
          <span>退出</span>
        </button>
      </div>
    </el-popover>
  </div>
</template>

<style scoped>
.user-menu-list {
  padding: 4px 0;
}

.menu-item {
  width: 100%;
  border: none;
  background: none;
  text-align: left;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.menu-item:hover {
  background-color: var(--el-color-primary-light-9);
}

.menu-item .el-icon {
  margin-right: 8px;
  font-size: 16px;
}

.divider {
  margin: 4px 0;
  border-top: 1px solid var(--el-border-color-lighter);
}

.avatar-box {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.3s;
}


.avatar-box .avatarBtn {
  width: 32px;
  height: 32px;
  border-radius: 50%;  
}

.avatar-box .el-text {
  margin-left: 8px;
  white-space: nowrap;  
}

:deep(.el-avatar) {
  font-size: 16px;
  font-weight: bold;
}
</style>
