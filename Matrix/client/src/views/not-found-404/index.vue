<script setup lang="ts">
/**
 * 
 * @author Prk
 */

const { push } = useRouter();
</script>

<template>
  <ElEmpty>
    <template #description>
        <h4>
            <b>
                你找的页面没了
            </b>
        </h4>
    </template>

    <ElButton type="primary" @click="push({ name: 'home' })">
        返回首页
    </ElButton>
  </ElEmpty>
</template>

<style lang="scss" scoped />
