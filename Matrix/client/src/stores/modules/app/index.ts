import { defineStore } from 'pinia';
import { HomeFilled } from '@element-plus/icons-vue';
import type { Tab } from './types';

const pathFilter: string[] = [
    '/',
    '/home',
    '/login'
];

const homeTab: Tab = {
    name: '首页',
    path: '/home',
    icon: h(HomeFilled),
    to: {
        name: 'home'
    }
};

export const useAppStore = defineStore('app', () => {
    const menuTabs = ref<Tab[]>([]);
    const activeIndex = ref<string>('');

    /**
     * 添加新的标签页
     */
    const addTab = (route: RouteLocationRaw) => {
    };

    return {
        menuTabs, addTab
    };
}, {
    persist: true
});
