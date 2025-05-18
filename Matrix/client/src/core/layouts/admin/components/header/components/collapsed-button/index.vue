<script setup lang="ts">
/**
 * 菜单折叠按钮
 * @author Prk<code@imprk.me>
 */

import IconCollapsed from './icons/IconCollapsed.vue';

const { collapse } = refStore(useAppStore());
const { toggleCollapse } = useAppStore();

const isDark = useDark();
</script>

<template>
    <div class="flex p-0-0-0-15px items-center" @click="toggleCollapse">
        <IconCollapsed
            :class="[
                'icon inline-block vertical-middle w-20px h-20px cursor-pointer',
                {
                    active: collapse,
                    dark: isDark
                }
            ]"
        />
    </div>
</template>

<style lang="scss" scoped>
.icon {
    transition: transform .3s ease;
    fill: #000000;

    .active {
        transform: rotate(180deg);
    }

    .dark {
        fill: #FFFFFF;
    }
}
</style>
