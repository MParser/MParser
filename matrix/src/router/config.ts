/**
 * 路由配置
 * @author Prk<code@imprk.me>
 */

import type { RouterConfig } from './type';

export const config: RouterConfig = {
    /**
     * 路由模式
     * @author Prk<code@imprk.me>
     * @example history
     * 除非写 hash，否则都是 history 模式
     */
    mode: 'history',

    /**
     * NProgress 配置
     * @author Prk<code@imprk.me>
     */
    nprogress: {
        showSpinner: false
    }
};
