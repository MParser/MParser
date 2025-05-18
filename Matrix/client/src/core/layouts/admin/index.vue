<script setup lang="ts">
/**
 * 管理后台布局
 * @author Prk<code@imprk.me>
 */

import Menu from './components/menu/index.vue';
import Header from './components/header/index.vue';
import Footer from './components/footer/index.vue';
// import Menutab from './components/menutab/index.vue';
</script>

<template>
    <ElContainer class="MainView">
        <!--  左侧导航栏  -->
        <Menu />
        <!--  主体内容  -->
        <ElContainer style="display: flex; flex-direction: column; border: 1px solid gray;">
            <Header />
            <!-- <Menutab /> -->
            <div class="MainContent">
                <RouterView />
            </div>
            <Footer  />
        </ElContainer>
    </ElContainer>
</template>

<style lang="scss" scoped>
.MainView {
    height: 97vh;
    width: 99vw;
    margin: 10px 0;
    max-width: 99vw;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    flex-grow: 1;

}

.MainContent{
    width: 100%;
    height: 100%;
    overflow: auto;
    border-top: 1px ridge gray;
    border-bottom: 1px ridge gray;
    padding: 10px;
}



</style>