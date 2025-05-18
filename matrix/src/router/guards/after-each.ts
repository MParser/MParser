import NProgress from 'nprogress';
import type {
    RouteLocationNormalized,
    RouteLocationNormalizedLoaded,
    NavigationFailure
} from 'vue-router';

export const afterEach = (
    to: RouteLocationNormalized,
    from: RouteLocationNormalizedLoaded,
    failure?: NavigationFailure | void
) => {
    setTimeout((): void => {
        NProgress.done();
    }, 100);
};
