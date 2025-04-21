<template>
  <div class="home-container">
    <el-row :gutter="20">
      <!-- 欢迎卡片 -->
      <el-col :span="16">
        <el-card class="welcome-card">
          <template #header>
            <div class="card-header">
              <span>欢迎回来</span>
              <span class="current-time">{{ currentTime }}</span>
            </div>
          </template>
          <div class="welcome-content">
            <el-avatar :size="64" :src="userAvatar">
              {{ userInfo.username.charAt(0).toUpperCase() }}
            </el-avatar>
            <div class="welcome-info">
              <h3>{{ userInfo.username }}</h3>
              <p>上次登录时间：{{ userInfo.lastLoginTime }}</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 快捷操作卡片 -->
      <el-col :span="8">
        <el-card class="quick-action-card">
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <div
              v-for="action in quickActions"
              :key="action.title"
              class="action-item"
              @click="handleCommand(action.command)"
              v-loading="action.command === 'logout' && logoutLoading"
              element-loading-background="rgba(255, 255, 255, 0.7)"
            >
              <el-icon :style="{ color: action.color }">
                <component :is="action.icon" />
              </el-icon>
              <span>{{ action.title }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 系统公告卡片 -->
    <el-col :span="24" class="mt-20">
      <el-card class="announcement-card">
        <template #header>
          <div class="card-header">
            <span>系统公告</span>
            <div class="header-right">
              <el-tooltip 
                content="刷新公告" 
                placement="left"
                :hide-after="100"
                :show-after="100"
              >
                <el-button
                  class="refresh-btn"
                  :icon="Refresh"
                  circle
                  plain
                  @click="fetchAnnouncements"
                  :loading="loading"
                />
              </el-tooltip>
            </div>
          </div>
        </template>
        <div class="announcement-wrapper">
          <el-scrollbar class="custom-scrollbar">
            <div class="announcement-content-container">
              <el-timeline>
                <el-timeline-item
                  v-for="(item, index) in announcements"
                  :key="index"
                  :type="item.type"
                  :timestamp="item.date"
                  size="large"
                >
                  <h4>{{ item.title }}</h4>
                  <p class="announcement-text">{{ item.content }}</p>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-scrollbar>
        </div>
      </el-card>
    </el-col>
  </div>
</template>

<script setup>
import { Logout, getAnnouncements } from "@/apis/sys/user";
import { userStore } from "@/store/sys/user";
import { Refresh } from "@element-plus/icons-vue";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const user = userStore();
const router = useRouter();
const announcements = ref([]);
const userInfo = computed(() => user.userInfo);
const userAvatar = computed(() => userInfo.value.avatar || "");
const currentTime = ref("");
const loading = ref(false);
const logoutLoading = ref(false);

// 更新当前时间
const updateCurrentTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  currentTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 获取系统公告
const fetchAnnouncements = async () => {
  loading.value = true;
  announcements.value = [];
  try {
    const res = await getAnnouncements();
    if (res.success) {
      announcements.value = res.data;
    }
  } finally {
    loading.value = false;
  }
};

// 退出登录
const handleLogout = async () => {
  logoutLoading.value = true;
  NProgress.start();
  try {
    const res = await Logout();
    if (res.success) {
      router.push("/login");
    }
  } catch (error) {
    console.error(error);
  } finally {
    logoutLoading.value = false;
    NProgress.done();
  }
};

onMounted(() => {
  updateCurrentTime();
  // 每秒更新一次时间
  setInterval(updateCurrentTime, 1000);
  // 获取系统公告
  fetchAnnouncements();
});

// 快捷操作
const quickActions = [
  {
    title: "个人中心",
    icon: "User",
    color: "#409EFF",
    command: "profile"
  },
  {
    title: "退出登录",
    icon: "SwitchButton",
    color: "#F56C6C",
    command: "logout"
  }
];

// 处理快捷操作
const handleCommand = async (command) => {
  switch (command) {
    case "profile":
      router.push("/user");
      break;
    case "logout":
      await handleLogout();
      break;
  }
};
</script>

<style scoped>
.home-container {
  padding: 20px;

  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.mt-20 {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.current-time {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

/* 欢迎卡片和快捷操作卡片等高 */
:deep(.el-card.welcome-card),
:deep(.el-card.quick-action-card) {
  height: 180px;
}

.welcome-content {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
}

.welcome-info h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
}

.welcome-info p {
  margin: 0;
  color: var(--el-text-color-secondary);
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  height: 100%;
  align-items: center;
  padding: 0;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.action-item:hover {
  background-color: var(--el-fill-color-light);
}

.action-item .el-icon {
  font-size: 24px;
}

.action-item span {
  font-size: 14px;
}

.announcement-card :deep(.el-card__body) {
  height: calc(100vh - 480px);
  min-height: 100px;
  padding: 0;
}

.announcement-wrapper {
  height: 100%;
}

/* 自定义滚动条样式 */
.custom-scrollbar {
  height: 100%;
}

.custom-scrollbar :deep(.el-scrollbar__bar) {
  opacity: 1 !important; /* 始终显示滚动条 */
  background-color: var(--el-border-color-lighter);
}

.announcement-content-container {
  padding: 20px;
}

.announcement-text {
  margin: 5px 0;
  color: var(--el-text-color-regular);
  font-size: 14px;
  line-height: 1.5;
}

:deep(.el-timeline) {
  padding: 0;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.refresh-btn {
  padding: 8px;
}

.refresh-btn :deep(.el-icon) {
  font-size: 16px;
}
</style>
