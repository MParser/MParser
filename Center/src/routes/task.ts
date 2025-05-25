/**
 * 任务路由
 */
import { Router } from 'express';
import { TaskController } from '../controllers/task';
import { TaskDataController } from '../controllers/taskdata';

const router = Router();
export const routePath = '/task';
// 获取任务列表
router.get('/', TaskController.list);

// 检查时间范围
router.get('/check', TaskController.checkTime);

// 获取去重时间范围 getTimeRange
router.get('/getTimeRange', TaskController.getTimeRange);

// 获取任务详情
router.get('/:id', TaskController.get);

// 创建任务
router.post('/create', TaskController.create);

// 删除任务
router.delete('/:id', TaskController.delete);

router.get('/:id/data', TaskDataController.getTaskData);

export default router;
