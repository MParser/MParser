<script setup lang="ts">
import { appConfig } from '~/config';

const { meta } = useRoute();
</script>

<template>
  <ElContainer
      class="auth flex flex-col justify-center items-center h-100vh w-100vw"
  >
    <span class="title">
      {{ appConfig.title }}
    </span>

    <div class="content">
      <span class="title">
        {{ meta?.title ?? 'Login' }}
      </span>

      <RouterView />
    </div>
  </ElContainer>
</template>

<style lang="scss" scoped>
.auth {
  display: flex;
  flex-direction: column;

  .title {
    font-family: "TypoGraphica", "argon", "Arial Narrow", serif;
    font-size: 3em;
    letter-spacing: 2px;
    background: linear-gradient(
            120deg,
            grey,
            cornflowerblue,
            coral,
            darkgoldenrod
    );
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
    margin-bottom: 20px;
  }

  :deep(.form-item .el-form-item__label) {
    white-space: nowrap;
    height: 32px;
    line-height: 32px;
  }
}
</style>
