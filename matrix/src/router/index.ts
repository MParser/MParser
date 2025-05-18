import { config } from './config';
import { routes } from './helper';

/**
 * NProgress 进度条配置
 * @author Prk<code@imprk.me>
 */
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
if (config.nprogress) NProgress.configure(config.nprogress);

/**
 * 路由配置
 * @author Prk<code@imprk.me>
 */
import { createRouter, createWebHistory } from 'vue-router';
import type { Router } from 'vue-router';
const router: Router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

/**
 * 路由守卫 Router Guards
 * @author Prk<code@imprk.me>
 */
import { beforeEach, afterEach } from './guards';
router.beforeEach(beforeEach);
router.afterEach(afterEach);

export default router;
