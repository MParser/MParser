/**
 * 首页页面配置
 */

import { HomeFilled } from '@element-plus/icons-vue';

export default <Page>{
    title: '主页',
    menu: {
        order: 1000,
        icon: h(HomeFilled),
        to: {
            name: 'home'
        }
    }
};
