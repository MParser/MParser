<script setup lang="ts">
/**
 * 后台管理布局之菜单组件
 * @author Prk<code@imprk.me>
 */

// import { useMenu } from './hooks/use-menu';
import { appConfig } from '~/config';
import tempMenu from './temp';
import SubMenu  from '../submenu/index.vue';

// const { menus, href } = useMenu();

// const { collapse } = refStore(useAppStore());

const title: string = appConfig.title ?? '管理后台';

// 先写死,你先完成样式,后面挪一下 temp 文件
const menus = tempMenu();
console.log(menus, 'mm');
</script>

<template>
    <ElAside class="main-nav">
        <ElMenu
            popperClass="menu-popper"
            router
        >
            <span class="main-nav-title">
                {{ title }}
            </span>
            
            <!-- 循环遍历根菜单项，为每个菜单项创建一个 SubMenu 组件 -->
            <SubMenu 
                v-for="menuItem in menus" 
                :key="menuItem.title" 
                :menus="menuItem" 
            />

            <!-- <div v-else class="main-nav-title" style="padding: 14px;">
                <img
                    src="/favicon.svg"
                    alt="favicon"
                    width="32"
                    height="32"
                />
            </div> -->


        </ElMenu>
    </ElAside>
</template>

<style lang="scss" scoped >
.main-nav {
    width: auto;
    display: flex;
    flex-direction: row;
}
.main-nav-title {
    margin: 0 5px;
    display: flex;
    justify-content: center;
    font-family: "TypoGraphica", "Arial Narrow", serif;
    font-size: 2.5em;
    letter-spacing: 2px;
    cursor: pointer;
    position: relative;
    background: linear-gradient(90deg, grey, cornflowerblue, coral, darkgoldenrod);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent; 
}
</style>
