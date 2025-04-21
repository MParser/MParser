import { userRoutes } from "@/store/sys/routes.js";
import { defineStore } from "pinia";

/**
 * 标签页管理存储
 * 用于管理系统的标签页状态，包括打开的标签、活动标签等
 */
const tabStore = defineStore("tabs", {
  state: () => ({
    // 首页标签配置
    homeTab: {
      name: "首页",
      path: "/home",
      icon: "BiHome",
      component: import("@/views/sys/Home.vue")
    },
    // 标签页过滤器
    pathFilter: ["/", "/home", "/login"],
    // 当前打开的标签页数组
    openTab: [],
    // 当前激活的标签页索引
    activeIndex: ""
  }),
  actions: {
    /**
     * 初始化标签页状态
     */
    init() {
      if (this.openTab.length === 0) {
        this.openTab = [this.homeTab];
      }
      const currentPath = window.location.pathname;

      const existingTab = this.openTab.find((tab) => tab.path === currentPath);
      if (existingTab) {
        this.setActiveIndex(currentPath);
      }
    },
    /**
     * 添加新标签页
     * @param {Object} data - 标签页对象
     * @param {string} data.name - 标签页名称
     * @param {string} data.path - 标签页路径
     * @param {string} data.icon - 标签页图标
     */
    addTabs(data) {
      const findComponentByPath = (path, routes) => {
        for (const route of routes) {
          if (route.path === path) {
            return route.component;
          }
          if (route.children) {
            const found = findComponentByPath(path, route.children);
            if (found) return found;
          }
        }
        return null;
      };

      if (data.name === "NotFound") {
        const index = this.openTab.findIndex(
          (option) => option.name === data.name
        );
        if (index !== -1) {
          this.openTab[index] = {
            ...this.openTab[index],
            path: data.path,
            icon: data.icon || "BiHome",
            component:
              findComponentByPath(data.path, userRoutes.value) || data.name
          };
          this.activeIndex = this.openTab[index].path;
          return;
        }
      }

      const tabData = {
        ...data,
        icon: data.icon || "",
        component: findComponentByPath(data.path, userRoutes.value) || data.name
      };

      if (!this.pathFilter.includes(tabData.path)) {
        this.openTab.push(tabData);
      }
    },
    /**
     * 设置当前激活的标签页
     * @param {string} index - 要激活的标签页路径
     */
    setActiveIndex(index) {
      this.activeIndex = index;
    },
    /**
     * 删除指定标签页
     * @param {string} path - 要删除的标签页路径
     */
    deleteTabs(path) {
      const index = this.openTab.findIndex((option) => option.path === path);
      if (index !== -1) {
        this.openTab.splice(index, 1);
      }
    },
    /**
     * 重排标签页
     * @param {number} fromIndex - 开始索引
     * @param {number} toIndex - 结束索引
     */
    reorderTabs(fromIndex, toIndex) {
      const tabToMove = this.openTab[fromIndex];

      this.openTab.splice(fromIndex, 1);

      this.openTab.splice(toIndex, 0, tabToMove);

      this.openTab = [...this.openTab];
    },
    /**
     * 清空所有标签页
     */
    clean() {
      this.$reset();
    }
  },
  persist: {
    storage: window.sessionStorage
  }
});

export { tabStore };
