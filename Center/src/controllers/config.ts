/**
 * 配置接口内容
 */
import { Request, Response } from 'express';
import logger from '../utils/logger';
import { config } from '../utils/config';


export class ConfigReader {
    /**
     * 获取配置信息
     * @param req 请求对象
     * @param res 响应对象
     * @returns 配置信息
    */

    static async getConfig(req: Request, res: Response): Promise<void> {
        // 获取MySQL 配置
       try {
            const mysql_info = config.get('mysql');
            const redis_info = config.get('redis');
            const clickhouse_info = config.get('clickhouse');
            const result = {
                mysql: mysql_info,
                redis: redis_info,
                clickhouse: clickhouse_info
            }
            res.success(result, '获取配置成功');
       }catch (error: any) {
            logger.error('获取配置失败:', error);
            res.internalError('获取配置失败');
       }
    }
}