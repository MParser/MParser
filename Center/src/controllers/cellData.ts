/**
 * cellData控制器
 */
import { Request, Response } from 'express';
import mysql from '../database/mysql';
import logger from '../utils/logger';
import fs from 'fs';
import csv from 'csv-parser';
import iconv from 'iconv-lite';

export class CellDataController {
    // 查询列表 - 支持分页和条件查询
    static async list(req: Request, res: Response): Promise<void> {
        try {
            const { page = 1, pageSize = 10, field, value, keyword } = req.query;
            
            const skip = (Number(page) - 1) * Number(pageSize);
            const take = Number(pageSize);
            
            let where: any = {};
            
            // 处理精确匹配查询（指定字段名和包含内容）
            if (field && value && typeof field === 'string') {
                where[field] = {
                    contains: value
                };
            }
            
            // 处理模糊查询（不指定字段，只提供关键词）
            if (keyword && !field) {
                where = {
                    OR: [
                        { CGI: { contains: String(keyword) } },
                        { eNodeBID: keyword ? Number(keyword) : undefined },
                        { PCI: keyword ? Number(keyword) : undefined },
                        { Azimuth: keyword ? Number(keyword) : undefined },
                        { Earfcn: keyword ? Number(keyword) : undefined },
                        { Freq: keyword ? Number(keyword) : undefined },
                        { eNBName: { contains: String(keyword) } },
                        { userLabel: { contains: String(keyword) } },
                        { Longitude: keyword ? Number(keyword) : undefined },
                        { Latitude: keyword ? Number(keyword) : undefined }
                    ]
                };
            }
            
            // 查询总数
            const total = await mysql.cellData.count({ where });
            
            // 查询数据
            const cellDataList = await mysql.cellData.findMany({
                where,
                skip,
                take,
                orderBy: {
                    updatedAt: 'desc'
                }
            });
            
            res.success({
                list: cellDataList,
                pagination: {
                    total,
                    page: Number(page),
                    pageSize: Number(pageSize)
                }
            }, '获取小区数据列表成功');
        } catch (error: any) {
            logger.error('获取小区数据列表失败:', error);
            res.internalError('获取小区数据列表失败');
        }
    }

    // 获取单个小区数据
    static async get(req: Request, res: Response): Promise<void> {
        try {
            const CGI = req.params.cgi;
            const cellData = await mysql.cellData.findUnique({ where: { CGI } });
            
            if (cellData) {
                res.success(cellData, '获取小区数据成功');
            } else {
                res.notFound('小区数据不存在');
            }
        } catch (error: any) {
            logger.error('获取小区数据失败:', error);
            res.internalError('获取小区数据失败');
        }
    }

    // 创建小区数据
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const data = req.body;
            
            // 检查所有必填字段（除了createdAt和updatedAt）
            const requiredFields = ['CGI', 'eNodeBID', 'PCI', 'Earfcn', 'Freq', 'Longitude', 'Latitude'];
            
            for (const field of requiredFields) {
                if (data[field] === undefined || data[field] === null || data[field] === '') {
                    return res.badRequest(`字段 ${field} 不能为空`);
                }
            }
            
            // 检查CGI是否已存在
            const existingCell = await mysql.cellData.findUnique({
                where: { CGI: data.CGI }
            });
            
            if (existingCell) {
                return res.badRequest('CGI已存在，不能重复添加');
            }
            
            // 创建数据
            const cellData = await mysql.cellData.create({ data });
            res.success(cellData, '创建小区数据成功');
        } catch (error: any) {
            logger.error('创建小区数据失败:', error);
            res.internalError('创建小区数据失败');
        }
    }

    // 更新小区数据
    static async update(req: Request, res: Response): Promise<void> {
        try {
            const CGI = req.params.cgi;
            const data = req.body;
            
            // 检查是否存在
            const existingCell = await mysql.cellData.findUnique({
                where: { CGI }
            });
            
            if (!existingCell) {
                return res.notFound('小区数据不存在');
            }
            
            // 不允许修改CGI
            if (data.CGI && data.CGI !== CGI) {
                return res.badRequest('不允许修改CGI');
            }
            
            // 更新数据
            const cellData = await mysql.cellData.update({
                where: { CGI },
                data
            });
            
            res.success(cellData, '更新小区数据成功');
        } catch (error: any) {
            logger.error('更新小区数据失败:', error);
            res.internalError('更新小区数据失败');
        }
    }

    // 删除小区数据（支持批量删除和全部删除）
    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const { cgis } = req.body;
            
            // 如果传入了CGI数组，进行批量删除
            if (cgis && Array.isArray(cgis) && cgis.length > 0) {
                await mysql.cellData.deleteMany({
                    where: {
                        CGI: {
                            in: cgis
                        }
                    }
                });
                
                return res.success(null, `成功删除${cgis.length}条小区数据`);
            } 
            // 如果传入了单个CGI路径参数，删除单个
            else if (req.params.cgi) {
                const CGI = req.params.cgi;
                const existingCell = await mysql.cellData.findUnique({
                    where: { CGI }
                });
                
                if (!existingCell) {
                    return res.notFound('小区数据不存在');
                }
                
                await mysql.cellData.delete({ where: { CGI } });
                return res.success(null, '删除小区数据成功');
            }
            // 未提供CGI参数，执行全部删除
            else {
                const deleteResult = await mysql.cellData.deleteMany({});
                return res.success(null, `已删除所有小区数据，共${deleteResult.count}条`);
            }
        } catch (error: any) {
            logger.error('删除小区数据失败:', error);
            res.internalError('删除小区数据失败');
        }
    }

    // 上传CSV文件处理
    static async upload(req: Request & { file?: Express.Multer.File }, res: Response): Promise<void> {
        if (!req.file) {
            return res.badRequest('未上传文件');
        }

        try {
            const filePath = req.file.path;
            const results: any[] = [];
            const errors: any[] = [];
            let success = 0;
            let failed = 0;

            // 处理GBK编码的CSV文件
            fs.createReadStream(filePath)
                .pipe(iconv.decodeStream('gbk'))
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', async () => {
                    // 删除临时文件
                    fs.unlinkSync(filePath);

                    // 处理每一行数据
                    for (const row of results) {
                        try {
                            // 转换数据类型
                            const cellData = {
                                CGI: row.CGI,
                                eNodeBID: parseInt(row.eNodeBID),
                                PCI: parseInt(row.PCI),
                                Azimuth: row.Azimuth ? parseInt(row.Azimuth) : null,
                                Earfcn: parseInt(row.Earfcn),
                                Freq: parseFloat(row.Freq),
                                eNBName: row.eNBName || null,
                                userLabel: row.userLabel || null,
                                Longitude: parseFloat(row.Longitude),
                                Latitude: parseFloat(row.Latitude)
                            };

                            // 检查必填字段
                            const requiredFields = ['CGI', 'eNodeBID', 'PCI', 'Earfcn', 'Freq', 'Longitude', 'Latitude'];
                            const missingFields = requiredFields.filter(field => (cellData as any)[field] === undefined || (cellData as any)[field] === null || (cellData as any)[field] === '');

                            if (missingFields.length > 0) {
                                errors.push({
                                    row,
                                    reason: `缺少必填字段: ${missingFields.join(', ')}`
                                });
                                failed++;
                                continue;
                            }

                            // 检查CGI是否存在
                            const existingCell = await mysql.cellData.findUnique({
                                where: { CGI: cellData.CGI }
                            });

                            if (existingCell) {
                                // 更新逻辑：仅更新不为空的字段
                                const updateData: any = {};
                                for (const key in cellData) {
                                    if (key !== 'CGI' && (cellData as any)[key] !== null && (cellData as any)[key] !== undefined && (cellData as any)[key] !== '') {
                                        updateData[key] = (cellData as any)[key];
                                    }
                                }

                                await mysql.cellData.update({
                                    where: { CGI: cellData.CGI },
                                    data: updateData
                                });
                            } else {
                                // 新增数据
                                await mysql.cellData.create({
                                    data: cellData
                                });
                            }
                            success++;
                        } catch (error) {
                            errors.push({
                                row,
                                reason: (error as Error).message || '未知错误'
                            });
                            failed++;
                        }
                    }

                    res.success({
                        total: results.length,
                        success,
                        failed,
                        errors: errors.length > 0 ? errors : null
                    }, '文件处理完成');
                });
        } catch (error: any) {
            logger.error('处理上传文件失败:', error);
            res.internalError('处理上传文件失败');
        } finally {
            // 删除上传的数据,如果不存在则跳过
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
                logger.debug('已删除上传的文件:', req.file.path);
            }

        }
    }

    // 下载所有数据
    static async download(req: Request, res: Response): Promise<void> {
        try {
            const cellDataList = await mysql.cellData.findMany({
                orderBy: {
                    updatedAt: 'desc'
                }
            });
            
            res.success(cellDataList, '获取所有小区数据成功');
        } catch (error: any) {
            logger.error('获取小区数据失败:', error);
            res.internalError('获取小区数据失败');
        }
    }
}
