<script setup lang="ts">
/**
 * 面包屑导航组件
 * @author Prk<code@imprk.me>
 */

const { meta } = toRefs(useRoute());

const breadcrumbs = computed<string[]>(
    (): string[] => [
        (meta.value.title as string)
    ]
);
</script>

<template>
    <div class="flex items-center">
        <ElBreadcrumb separator="/">
            <ElBreadcrumbItem v-for="item in breadcrumbs" :key="item">
                {{ item }}
            </ElBreadcrumbItem>
        </ElBreadcrumb>
    </div>
</template>

<style lang="scss" scoped />
