// noinspection JSUnresolvedReference,JSUnusedLocalSymbols
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { createRouter, createWebHistory } from "vue-router";
import { userRoutes } from "../store/sys/routes.js";

// 路由配置
const routes = [
  // 定义404页面
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/sys/404.vue"),
    meta: {
      hidden: true,
      requiresAuth: false,
    },
  },
  {
    path: "/redirect/:path(.*)",
    component: () => import("@/views/sys/Redirect.vue"), // 重定向组件
    meta: {
      hidden: true,
      requiresAuth: false,
    },
  },
  {
    path: "/",
    name: "/",
    component: () => import("@/views/sys/Home.vue"),
    redirect: "/home",
    meta: {
      hidden: true,
      icon: "BiHome",
    },
  },
  {
    path: "/home",
    name: "首页",
    component: () => import("@/views/sys/Home.vue"),
    meta: {
      hidden: false,
      icon: "BiHome",
    },
  },
  {
    path: "/user",
    name: "个人中心",
    component: () => import("@/views/sys/User.vue"),
    meta: {
      icon: "BiUser",
      requiresAuth: true,
    },
  },
  {
    path: "/usermanage",
    name: "用户管理",
    component: () => import("@/views/sys/UserManage.vue"),
    meta: {
      icon: "PiUsersDuotone",
      requiresAuth: true,
    },
  },
  {
    path: "/department",
    name: "部门管理",
    component: () => import("@/views/sys/Department.vue"),
    meta: {
      icon: "PiNetwork",
      requiresAuth: true,
    },
  },
  {
    path: "/role",
    name: "角色管理",
    component: () => import("@/views/sys/Role.vue"),
    meta: {
      icon: "BsPeople",
      requiresAuth: true,
    },
  },
  {
    path: "/gateway",
    name: "网关管理",
    component: () => import("@/views/MParser/gateway/index.vue"),
    meta: {
      icon: "PiNetwork",
      requiresAuth: true,
    },
  },
  {
    path: "/nds",
    name: "节点管理",
    component: () => import("@/views/MParser/nds/index.vue"),
    meta: {
      icon: "PiNetwork",
      requiresAuth: true,
    },
  },
  {
    path: "/parser",
    name: "解析器",
    component: () => import("@/views/MParser/parser/index.vue"),
    meta: {
      icon: "PiNetwork",
      requiresAuth: true,
    },
  },
  {
    path: "/scanner",
    name: "扫描器",
    component: () => import("@/views/MParser/scanner/index.vue"),
    meta: {
      icon: "PiNetwork",
      requiresAuth: true,
    },
  },
  {
    path: '/task',
    name: '任务管理',
    component: () => import('@/views/MParser/task/index.vue'),
    meta: {
      icon: 'PiNetwork',
      requiresAuth: true,
    },
  }
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 配置 NProgress
NProgress.configure({
  showSpinner: false,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 开始进度条
  NProgress.start();

  // 更新路由状态到 store
  userRoutes.value = routes;
  next();
});

router.afterEach(() => {
  // 确保在组件加载完成后结束进度条
  setTimeout(() => {
    NProgress.done();
  }, 100);
});

export default router;
