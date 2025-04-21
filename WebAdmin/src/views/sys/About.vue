<template>
  <div class="about-container">
    <el-card class="about-card">
      <template #header>
        <div class="about-header">
          <span class="title">{{ appTitle }}</span>
          <el-tag size="small">v{{ appVersion }}</el-tag>
        </div>
      </template>
      
      <div class="about-content">
        <p class="description">{{ appDescription }}</p>
        
        <el-divider>技术栈</el-divider>
        <div class="tech-stack">
          <el-tag v-for="tech in techStack" :key="tech" class="tech-item">
            {{ tech }}
          </el-tag>
        </div>

        <el-divider>功能特性</el-divider>
        <ul class="feature-list">
          <li v-for="feature in features" :key="feature">{{ feature }}</li>
        </ul>

        <el-divider>版权信息</el-divider>
        <p class="copyright">{{ copyright }}</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

// 从环境变量获取应用信息
const appTitle = import.meta.env.VITE_APP_TITLE
const appVersion = import.meta.env.VITE_APP_VERSION
const appDescription = import.meta.env.VITE_APP_DESCRIPTION
const copyright = import.meta.env.VITE_APP_COPYRIGHT

// 技术栈
const techStack = [
  'Vue 3',
  'Vite',
  'Element Plus',
  'Vue Router 4',
  'Pinia',
  'JavaScript'
]

// 功能特性
const features = [
  '✨ 现代化的用户界面设计',
  '🔐 完善的权限管理系统',
  '🌓 支持亮色/暗色主题切换',
  '📱 响应式布局，支持移动端',
  '🚀 基于 Vue 3 + Vite 构建，性能优异',
  '🎨 使用 Element Plus 组件库，美观易用',
  '📦 模块化设计，代码组织清晰'
]
</script>

<style scoped>
.about-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.about-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(120deg, var(--el-text-color-regular), var(--el-color-primary));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.about-content {
  padding: 20px 0;
}

.description {
  font-size: 16px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  margin-bottom: 20px;
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 20px 0;
}

.tech-item {
  font-size: 14px;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 20px 0;

  li {
    margin: 10px 0;
    color: var(--el-text-color-regular);
    font-size: 14px;
  }
}

.copyright {
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin: 20px 0 0 0;
}
</style>
