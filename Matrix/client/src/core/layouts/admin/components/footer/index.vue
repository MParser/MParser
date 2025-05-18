<script setup lang="ts">
/**
 * 页脚内容
 * @author Prk<code@imprk.me>
 */
import { appConfig } from '@/core/config';
const copyright: string = appConfig.copyright;
</script>

<template>
    <ElFooter class="footer mt-auto w-full h-auto text-center relative left-0 bottom-0 text-12px">
        {{ copyright }}
    </ElFooter>
</template>

<style lang="scss" scoped>
.footer {
    height: auto;
    left: 0;
    bottom: 0;
    width: 100%;
    text-align: center;
    padding: 3px 0;
    font-size: 12px;
    position: relative;
    margin-top: auto;
}
</style>
