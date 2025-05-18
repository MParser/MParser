/**
 * 路由配置
 * @author Prk<code@imprk.me>
 */

import type { NProgressOptions } from 'nprogress';

export interface RouterConfig {
    /**
     * 路由模式
     * @author Prk<code@imprk.me>
     * @example history
     */
    mode?: '' | 'history' | 'hash';

    /**
     * NProgress 配置
     * @author Prk<code@imprk.me>
     */
    nprogress?: Partial<NProgressOptions>;
};
