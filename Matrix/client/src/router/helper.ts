/**
 * 页面内容生成助手
 * @author Prk<code@imprk.me>
 */

import type { RouteRecordRaw } from 'vue-router';

const pages: Record<string, Page> = {
    ...import.meta.glob('@/views/**/page.ts', {
        eager: true,
        import: 'default'
    }),
    ...import.meta.glob('@/core/views/**/page.ts', {
        eager: true,
        import: 'default'
    }),
    ...import.meta.glob('@/modules/views/**/page.ts', {
        eager: true,
        import: 'default'
    })
};

const components: Record<string, () => Promise<unknown>> = {
    ...import.meta.glob('@/views/**/index.vue'),
    ...import.meta.glob('@/core/views/**/index.vue'),
    ...import.meta.glob('@/modules/views/**/index.vue')
};

// 检查路径是否包含components目录
const isComponentsPath = (path: string): boolean => {
    return path.includes('/components/');
};

// 检查路径是否在auth目录下
const isAuthPath = (path: string): boolean => {
    return path.startsWith('@/views/auth/') || path.startsWith('../views/auth/') || path.startsWith('/src/views/auth/') ||
        path.startsWith('@/core/views/auth/') || path.startsWith('../core/views/auth/') || path.startsWith('/src/core/views/auth/') ||
        path.startsWith('@/modules/views/auth/') || path.startsWith('../modules/views/auth/') || path.startsWith('/src/modules/views/auth/');
};

// 生成主要admin布局下的路由
const adminRoutes = Object.entries(pages)
    .filter(([path]) => !isComponentsPath(path) && !isAuthPath(path))
    .map(([path, meta]: [string, Page]): RouteRecordRaw => {
        const componentName: string = path.replace('page.ts', 'index.vue');
        const routePath: string = path
            .replace('@/views', '').replace('../views', '').replace('/src/views', '')
            .replace('@/core/views', '').replace('../core/views', '').replace('/src/core/views', '')
            .replace('@/modules/views', '').replace('../modules/views', '').replace('/src/modules/views', '')
            .replace('/page.ts', '') || '/';

        return {
            path: routePath,
            name: routePath.split('/').filter(Boolean).join('-') || 'index',
            component: components[componentName],
            meta: {
                ...meta
            }
        };
    });

// 生成auth布局下的路由
const authRoutes = Object.entries(pages)
    .filter(([path]) => !isComponentsPath(path) && isAuthPath(path))
    .map(([path, meta]: [string, Page]): RouteRecordRaw => {
        const componentName: string = path.replace('page.ts', 'index.vue');
        const routePath: string = path
            .replace('@/views', '').replace('../views', '').replace('/src/views', '')
            .replace('@/core/views', '').replace('../core/views', '').replace('/src/core/views', '')
            .replace('@/modules/views', '').replace('../modules/views', '').replace('/src/modules/views', '')
            .replace('/page.ts', '') || '/';

        return {
            path: routePath,
            name: 'auth-' + (routePath.split('/').filter(Boolean).join('-') || 'index'),
            component: components[componentName],
            meta: {
                ...meta
            }
        };
    });

export const routes: RouteRecordRaw[] = [
    // Admin布局路由
    {
        path: '/',
        name: 'admin',
        component: () => import('@/core/layouts/admin/index.vue'),
        redirect: {
            name: 'home'
        },
        children: adminRoutes
    },

    // Auth布局路由
    {
        path: '/auth',
        name: 'auth',
        component: () => import('@/core/layouts/auth/index.vue'),
        children: authRoutes
    }
];
