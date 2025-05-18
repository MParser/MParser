/**
 * 页面配置类型
 * @author Prk<code@imprk.me>
 */

export interface Page {
    /**
     * 标题
     * @author Prk<code@imprk.me>
     * @type {string}
     * @example 仪表盘
     */
    title: string;

    /**
     * 菜单配置
     * @author Prk<code@imprk.me>
     * @type {Menu}
     */
    menu?: Menu;
};

/**
 * 菜单配置
 * @author Prk<code@imprk.me>
 */
export interface Menu {
    /**
     * 菜单排序
     * @author Prk<code@imprk.me>
     * @type {number}
     * @example 1
     * 数字越小越靠前
     */
    order: number;

    /**
     * 菜单图标
     * @author Prk<code@imprk.me>
     * @type {VNode}
     */
    icon?: VNode;

    /**
     * 路由跳转
     * @author Prk<code@imprk.me>
     * @type {RouteLocationRaw}
     * @example { name: 'dashboard' }
     */
    to?: RouteLocationRaw;
};

/**
 * 侧边菜单
 */
export type SidebarMenu = Menu & {
    children?: SidebarMenu[]; // 比上面的菜单多了个无限嵌套
};
