/**
 * 小区数据路由
 */
import { Router } from "express";
import { CellDataController } from "../controllers/cellData";
import multer from "multer";
import path from "path";
import fs from "fs";

// 配置上传目录路径
const uploadDir = path.join(__dirname, '../../uploads/');

// 确保上传目录存在
if (!fs.existsSync(uploadDir)) {
    // 如果目录不存在，则创建该目录
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置文件上传
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // 使用已确保存在的上传目录
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        cb(null, `cellData-${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// 创建路由实例
const router = Router();
// 自定义路由路径
export const routePath = "/cell";

// 获取小区数据列表（支持分页和查询条件）
router.get("/list", CellDataController.list);

// 获取单个小区数据
router.get("/:cgi", CellDataController.get);

// 创建小区数据
router.post("/", CellDataController.create);

// 更新小区数据
router.put("/:cgi", CellDataController.update);

// 删除单个小区数据
router.delete("/:cgi", CellDataController.delete);

// 批量删除或删除全部小区数据
router.post("/batchDelete", CellDataController.delete);

// 上传CSV文件
router.post("/upload", upload.single('file'), CellDataController.upload);

// 下载所有小区数据
router.get("/download/all", CellDataController.download);

export default router;
