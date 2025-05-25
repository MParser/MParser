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
                // 根据字段类型使用不同的查询操作符
                // 数值类型字段列表
                const numericFields = ['eNodeBID', 'PCI', 'Azimuth', 'Earfcn', 'Freq', 'Longitude', 'Latitude'];
                
                if (numericFields.includes(field)) {
                    // 对于数值类型字段，实现类似模糊搜索的功能
                    // 使用Prisma的原生查询功能，构建一个对字符串形式比较的条件
                    where = {
                        [`${field}`]: {
                            // 使用原生SQL查询，将数值转为字符串后进行LIKE查询
                            // 使用Prisma的$queryRaw将非常复杂，这里我们改用一种更简单的方式
                        }
                    };
                    
                    // 获取该字段的所有数据，然后在内存中过滤
                    // 注意：这种方法只适合数据量不大的情况
                    // 先标记一下，稍后我们会修改查询逻辑
                    where._needPostFiltering = {
                        field, 
                        value: String(value)
                    };
                } else {
                    // 对于字符串类型字段，使用contains操作符
                    where[field] = {
                        contains: String(value)
                    };
                }
            }
            
            // 处理模糊查询（不指定字段，只提供关键词）
            if (keyword && !field) {
                // 标记需要对数值字段进行后处理
                where._needPostFiltering = true;
                where = {
                    OR: [
                        { CGI: { contains: String(keyword) } },
                        // 对于数值字段，不使用确切匹配，而是先获取所有数据再在代码中过滤
                        // 标记需要在后续处理中进行过滤的数值字段
                        !isNaN(Number(keyword)) ? { eNodeBID: { not: undefined } } : undefined,
                        !isNaN(Number(keyword)) ? { PCI: { not: undefined } } : undefined,
                        !isNaN(Number(keyword)) ? { Azimuth: { not: undefined } } : undefined,
                        !isNaN(Number(keyword)) ? { Earfcn: { not: undefined } } : undefined,
                        !isNaN(Number(keyword)) ? { Freq: { not: undefined } } : undefined,
                        { eNBName: { contains: String(keyword) } },
                        { userLabel: { contains: String(keyword) } },
                        !isNaN(Number(keyword)) ? { Longitude: { not: undefined } } : undefined,
                        !isNaN(Number(keyword)) ? { Latitude: { not: undefined } } : undefined
                    ]
                };
            }
            
            // 检查是否需要对数值进行模糊搜索
            const needPostFiltering = where._needPostFiltering || (keyword && !field && !isNaN(Number(keyword)));
            delete where._needPostFiltering; // 删除标记，因为Prisma不认识这个字段
            
            // 如果需要进行数值模糊搜索，我们需要获取所有数据后在内存中过滤
            if (needPostFiltering) {
                // 查询所有满足其他条件的数据
                const allDataList = await mysql.cellData.findMany({
                    where,
                    orderBy: {
                        updatedAt: 'desc'
                    }
                });
                
                // 在内存中进行模糊过滤
                const searchValue = field && value ? String(value) : String(keyword);
                
                // 数值类型字段列表
                const numericFields = ['eNodeBID', 'PCI', 'Azimuth', 'Earfcn', 'Freq', 'Longitude', 'Latitude'];
                
                // 过滤数据
                const filteredList = allDataList.filter(item => {
                    // 如果指定了字段，只检查该字段
                    if (field && typeof field === 'string') {
                        if (numericFields.includes(field)) {
                            return String(item[field as keyof typeof item]).includes(searchValue);
                        }
                        return false; // 如果不是数值字段，已经在Prisma查询中处理
                    } else {
                        // 如果没有指定字段，检查所有数值字段
                        return numericFields.some(numField => 
                            String(item[numField as keyof typeof item]).includes(searchValue)
                        );
                    }
                });
                
                // 计算分页
                const total = filteredList.length;
                const paginatedList = filteredList.slice(skip, skip + take);
                
                res.success({
                    list: paginatedList,
                    pagination: {
                        total,
                        page: Number(page),
                        pageSize: Number(pageSize)
                    }
                }, '获取小区数据列表成功');
            } else {
                // 不需要后处理，直接使用Prisma的查询结果
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
            }
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
                // 处理数据 - 使用批量处理和事务来提高性能
                logger.info('开始处理CSV文件，共', results.length, '行数据');
                logger.info('CSV文件路径:', filePath);
                
                // 批量大小
                const BATCH_SIZE = 500;
                
                // 预处理所有数据
                const validData: any[] = [];
                const cgiToIndex = new Map<string, number>(); // 用于跟踪每个CGI在validData中的索引
                
                // 第一步：预处理数据，验证字段
                for (let i = 0; i < results.length; i++) {
                    const row = results[i];
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
                        
                        // 将有效数据添加到数组中
                        validData.push(cellData);
                        cgiToIndex.set(cellData.CGI, validData.length - 1);
                    } catch (error) {
                        errors.push({
                            row,
                            reason: (error as Error).message || '预处理错误'
                        });
                        failed++;
                    }
                }
                
                // 第二步：批量获取所有已存在的CGI
                const allCgis = validData.map(data => data.CGI);
                const existingCells = await mysql.cellData.findMany({
                    where: {
                        CGI: {
                            in: allCgis
                        }
                    },
                    select: {
                        CGI: true
                    }
                });
                
                // 创建已存在CGI的集合便于快速查找
                const existingCGISet = new Set(existingCells.map(cell => cell.CGI));
                
                // 第三步：按批次处理数据
                for (let i = 0; i < validData.length; i += BATCH_SIZE) {
                    const batch = validData.slice(i, i + BATCH_SIZE);
                    
                    try {
                        // 使用事务批量处理
                        await mysql.$transaction(async (prisma) => {
                            for (const item of batch) {
                                try {
                                    const isExisting = existingCGISet.has(item.CGI);
                                    
                                    if (isExisting) {
                                        // 更新逻辑：仅更新不为空的字段
                                        const updateData: any = {};
                                        for (const key in item) {
                                            if (key !== 'CGI' && (item as any)[key] !== null && (item as any)[key] !== undefined && (item as any)[key] !== '') {
                                                updateData[key] = (item as any)[key];
                                            }
                                        }

                                        await prisma.cellData.update({
                                            where: { CGI: item.CGI },
                                            data: updateData
                                        });
                                    } else {
                                        // 新增数据
                                        await prisma.cellData.create({
                                            data: item
                                        });
                                    }
                                    success++;
                                } catch (error) {
                                    // 记录错误但不中断事务
                                    errors.push({
                                        data: item,
                                        reason: (error as Error).message || '数据处理错误'
                                    });
                                    failed++;
                                }
                            }
                        });
                    } catch (txError) {
                        // 事务失败，标记所有批次数据为失败
                        for (const item of batch) {
                            errors.push({
                                data: item,
                                reason: (txError as Error).message || '事务处理错误'
                            });
                            failed++;
                        }
                    }
                    
                    // 每处理完一批次，输出一次进度
                    logger.info(`批量处理进度: ${i + batch.length}/${validData.length} (成功: ${success}, 失败: ${failed})`);
                }
            // 文件处理完成后再删除文件
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    logger.debug('处理完成后删除上传的文件:', filePath);
                }
                res.success({
                    total: results.length,
                    success,
                    failed,
                    errors: errors.length > 0 ? errors : null
                }, '文件处理完成');
                
                
            });
        } catch (error: any) {
            // 如果在处理过程中发生错误，确保删除上传的文件
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                try {
                    fs.unlinkSync(req.file.path);
                    logger.debug('出错后删除上传的文件:', req.file.path);
                } catch (unlinkError) {
                    logger.error('删除上传文件失败:', unlinkError);
                }
            }
            logger.error('处理上传文件失败:', error);
            res.internalError('处理上传文件失败');
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
