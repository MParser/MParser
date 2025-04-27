import { Router } from "express";
import { ConfigReader } from "../controllers/config";
// 创建路由实例
const router = Router();
// 自定义路由路径（可选）
export const routePath = "/config";

router.get("/get", ConfigReader.getConfig);

export default router;