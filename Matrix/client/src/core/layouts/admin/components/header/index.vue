<script setup lang="ts">
/**
 * 管理员后台布局之头部组件
 * @author Prk<code@imprk.me>
 */

import CollapsedButton from './components/collapsed-button/index.vue';
import Breadcrumb from './components/breadcrumb/index.vue';
</script>

<template>
    <ElHeader class="flex flex-row content-center p-0 pr-16px h-48px justify-end">
        <!-- 左半边 -->
        <div class="flex flex-row items-center w-full">
            <!-- 菜单折叠按钮 -->
            <CollapsedButton />

            <!-- 面包屑导航 -->
            <Breadcrumb />
        </div>

        <!-- 右半边 -->
        <div class="right flex flex-row items-center w-auto gap-16px">
            <!-- TODO 你来完成 -->
            <!-- <theme-option />
            <user-profile /> -->
        </div>
    </ElHeader>
</template>

<style lang="scss" scoped>
.right {
    & > :nth-child(1)::after {
        content: '';
        position: absolute;
        right: -8px;
        top: 50%;
        transform: translateY(-50%);
        height: 20px;
        width: 1px;
        background-color: var(--el-border-color-lighter);
    }

    & > * {
        padding: 0 8px;
        position: relative;
    }
}
</style>
