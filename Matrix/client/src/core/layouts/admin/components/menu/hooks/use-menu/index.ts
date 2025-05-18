/**
 * useMenu 菜单钩子 Hook
 * @author Prk<code@imprk.me>
 */

export const useMenu = () => {
    const { push, getRoutes } = useRouter();

    const menus = computed(
        (): Menu[] => getRoutes()
            .filter((route): boolean => !!route.meta && !!route.meta.menu)
            .map((route): Menu => route.meta.menu as Menu)
    );

    const href = (route: RouteLocationRaw): void => {
        push(route);
    };

    return {
        menus,
        href
    };
};
