<script setup lang="ts">

const { push } = useRouter();
</script>

<template>
  <ElEmpty>
    <template #description>
        <h4>
            <b>
                页面不存在
            </b>
        </h4>
    </template>

    <ElButton type="primary" @click="push({ name: 'home' })">
        返回首页
    </ElButton>
  </ElEmpty>
</template>

<style lang="scss" scoped />
