<script setup lang="ts">


/**
 * 菜单组件 - 支持递归渲染
 */

// 定义组件名称，用于递归引用
defineOptions({
    name: 'SubMenu'
});

defineProps<{
    menus: SidebarMenu;
}>();
</script>

<template>
  <!-- 当有子菜单时显示为 SubMenu -->
  <ElSubMenu :index="menus.to.name" v-if="menus.children && menus.children.length > 0">
    <template #title>
        <div class="menu-title">
            <ElIcon>
                <component :is="menus.icon" v-if="menus.icon" class="menu-icon" />
            </ElIcon>
            <span>{{ menus.title }}</span>
        </div>
    </template>
    <SubMenu :menus="menu" v-for="menu in menus.children" :key="menu.title" />
  </ElSubMenu>
  
  <!-- 无子菜单时显示为 MenuItem -->
  <ElMenuItem 
    v-else 
    :index="menus.to.name"
    :route="menus.to"
  >
    <div class="menu-title">
        <ElIcon>
            <component :is="menus.icon" v-if="menus.icon" class="menu-icon" />
        </ElIcon>
        <span>{{ menus.title }}</span>
    </div>
  </ElMenuItem>
</template>

<style lang="scss" scoped>
.menu-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>