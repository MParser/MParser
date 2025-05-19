/**
 * 用户路由
 */
import { Router } from "express";
import { UserController } from "../controllers/user";

// 创建路由实例
const router = Router();
// 自定义路由路径
export const routePath = "/";

// 用户注册
router.post("/user/register", UserController.register);

// 用户登录
router.post("/user/login", UserController.login);

// 验证登录状态
router.get("/user/verify", UserController.verify);

// 用户登出
router.post("/user/logout", UserController.logout);

// 获取系统公告
router.get("/sys/announcements", UserController.getAnnouncements);

// 修改个人信息
router.put("/sys/user/info", UserController.updateUserInfo);

// 修改密码
router.put("/sys/user/password", UserController.updatePassword);

// 上传头像
router.post("/sys/user/avatar", UserController.uploadAvatar);

export default router;