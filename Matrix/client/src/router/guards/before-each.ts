import NProgress from 'nprogress';
import type {
    RouteLocationNormalized,
    RouteLocationNormalizedLoaded,
    NavigationGuardNext
} from 'vue-router';

export const beforeEach = (
    to: RouteLocationNormalized,
    from: RouteLocationNormalizedLoaded,
    next: NavigationGuardNext
) => {
    // TODO 权限判断

    NProgress.start();

    return next();
};
