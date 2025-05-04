import io
import copy
import json
import time
import asyncio
import zipfile
from fastapi import APIRouter
from app.core.logger import log
from aiomultiprocess import Pool
from app.core.task_queue import TaskQueue
from app.utils.server import Server, Gateway
from clickhouse_driver import Client as CKClient
from app.core.parse_lib import mro, mdt, ParseError

api_router = APIRouter(tags=["Parser API"])
log.info("Parser 模块加载完成")
server = Server()
task_queue: TaskQueue = None
process_pool: Pool = None
clickhouse_client = None # 全局ClickHouse客户端
clickhouse_lock = asyncio.Lock() # ClickHouse操作锁，避免多个进程同时操作导致竞争

# 全局配置变量
global_config = {
    "parser_info": None,
    "database_info": None,
    "is_running": False,
    "gateway_config": None
}

@api_router.get("/start")
async def start_parser():
    """
    启动Parser服务，初始化配置并启动处理任务的进程池
    """
    global task_queue, global_config, process_pool, clickhouse_client
    if global_config["is_running"]:
        return {"code": 400, "message": "Parser服务已经在运行中"}
    
    try:
        # 获取Parser配置信息
        parser_info = await server.get_parser_info()
        global_config["parser_info"] = parser_info
        log.info(f"获取到Parser配置: {json.dumps(parser_info, ensure_ascii=False)}")
        
        # 获取数据库配置信息
        database_info = await server.get_database_info()
        global_config["database_info"] = database_info
        log.info(f"获取到数据库配置: {json.dumps(database_info, ensure_ascii=False)}")
        
        # 从parser_info中提取ndsLinks的ID列表
        nds_ids = []
        for link in parser_info.get("gateway", {}).get("ndsLinks", []):
            nds_ids.append(link.get("ndsId"))
        
        if not nds_ids:
            log.warning("没有发现任何NDS配置")
            return {"code": 400, "message": "没有发现任何NDS配置"}
        
        # 初始化任务队列
        redis_config = database_info.get("redis", {})
        task_queue = TaskQueue(
            nds_ids=nds_ids,
            host=redis_config.get("host", "127.0.0.1"),
            port=redis_config.get("port", 6379),
            password=redis_config.get("password", ""),
            db=redis_config.get("database", 0)
        )
        
        if not await task_queue.connect():
            raise Exception("任务队列连接失败")

        # 初始化Gateway
        global_config["gateway_config"] = parser_info.get("gateway", {})
        
        # 获取进程池大小
        pool_size = parser_info.get("pools", 5)
        log.info(f"进程池大小设置为: {pool_size}")
        
        # 初始化进程池
        process_pool = Pool(pool_size)
        
        # 初始化ClickHouse连接
        try:
            ck_config = database_info.get("clickhouse", {})
            clickhouse_client = CKClient(
                host=ck_config.get("host", "localhost"),
                port=ck_config.get("port", 9000),
                user=ck_config.get("user", "default"),
                password=ck_config.get("password", ""),
                database=ck_config.get("database", "default")
            )
            # 测试连接
            clickhouse_client.execute('SELECT 1')
            log.info("ClickHouse连接成功")
        except Exception as e:
            log.error(f"ClickHouse连接失败: {str(e)}")
            await stop_parser()
            return {"code": 500, "message": f"ClickHouse连接失败: {str(e)}"}
        
        # 设置全局运行状态为True
        global_config["is_running"] = True
        
        # 启动任务处理器
        asyncio.create_task(process_tasks())
        
        return {"code": 200, "message": "Parser服务启动成功", "data": parser_info}
    
    except Exception as e:
        log.error(f"启动Parser服务失败: {str(e)}")
        # 确保关闭所有已打开的资源
        await stop_parser()
        return {"code": 500, "message": f"启动Parser服务失败: {str(e)}"}

@api_router.get("/stop")
async def stop_parser():
    """停止Parser服务，关闭进程池和Redis连接"""
    global task_queue, process_pool, global_config, clickhouse_client
    if not global_config["is_running"]:
        return {"code": 400, "message": "Parser服务未启动"}
    try:
        # 关闭任务队列
        if task_queue:
            await task_queue.close()
            task_queue = None
        
        # 关闭进程池
        if process_pool:
            await process_pool.close()
            process_pool = None
            
        # 关闭ClickHouse连接
        if clickhouse_client:
            clickhouse_client.disconnect()
            clickhouse_client = None
            
        global_config["is_running"] = False
        return {"code": 200, "message": "Parser服务已停止"}
    except Exception as e:
        log.error(f"停止Parser服务失败: {str(e)}")
        return {"code": 500, "message": f"停止Parser服务失败: {str(e)}"}

async def process_tasks():
    """
    处理从Redis中提取的任务，将任务直接分配给子进程
    """
    global process_pool, task_queue, global_config
    try:
        # 创建任务处理列表
        tasks = []
        
        log.info(f"任务处理器已启动，进程池就绪")
        
        while global_config["is_running"]:
            try:
                task_data = await task_queue.pop_task() # 从任务队列中获取任务, 当任务队列为空时会阻塞
                if not task_data:
                    await asyncio.sleep(0.1)
                    continue
                
                log.info(f"获取到任务: {json.dumps(task_data, ensure_ascii=False)}")
                
                # 提取任务数据
                nds_id = task_data.get("ndsId")
                file_path = task_data.get("file_path")
                data_type = task_data.get("data_type", "").upper()  # MRO 或 MDT
                
                if not nds_id or not file_path or not data_type:
                    log.warning(f"任务数据不完整: {json.dumps(task_data, ensure_ascii=False)}")
                    continue
                
                # 构建任务参数
                task_params = {
                    "task_data": task_data,
                    "gateway_config": global_config["gateway_config"],
                    "database_config": global_config["database_info"]
                }
                # 使用深度复制
                task_params = copy.deepcopy(task_params)
                
                # 直接提交任务到进程池，在子进程中读取文件和处理数据
                task = asyncio.create_task(process_in_pool(process_pool, task_params))
                tasks.append(task)  
                
                # 清理已完成的任务
                tasks = [t for t in tasks if not t.done()]
                
                # 控制并发，确保任务数不超过进程池大小
                pool_size = global_config["parser_info"].get("pools", 5)
                while len(tasks) >= pool_size:
                    await asyncio.sleep(0.5)
                    tasks = [t for t in tasks if not t.done()]
                
            except Exception as e:
                log.error(f"处理任务过程中发生错误: {str(e)}")
                await asyncio.sleep(1)
    finally:
        # 关闭进程池
        if process_pool:
            await process_pool.close()
            process_pool = None
        global_config["is_running"] = False
        return {"code": 200, "message": "Parser服务已停止"}
    
async def insert_data_to_clickhouse(data, data_type, file_hash, file_path, database_config):
    """
    将解析后的数据插入到ClickHouse数据库
    
    :param data: 要插入的数据
    :param data_type: 数据类型 (MRO 或 MDT)
    :param file_hash: 文件哈希值
    :param file_path: 文件路径
    :param database_config: 数据库配置信息
    :return: (bool, str) - 是否成功及错误信息
    """
    global clickhouse_client, clickhouse_lock, server
    
    # 使用锁确保同一时间只有一个进程访问ClickHouse
    async with clickhouse_lock:
        try:
            # 检查ClickHouse连接是否有效，并在连接无效时重试
            try:
                if clickhouse_client:
                    clickhouse_client.execute('SELECT 1')
                else:
                    raise Exception("ClickHouse客户端不存在")
            except Exception as e:
                log.warning(f"ClickHouse连接测试失败，尝试重新连接: {str(e)}")
                # 重新初始化连接
                ck_config = database_config.get("clickhouse", {})
                if clickhouse_client:
                    try:
                        clickhouse_client.disconnect()
                    except Exception:
                        pass
                clickhouse_client = CKClient(
                    host=ck_config.get("host", "localhost"),
                    port=ck_config.get("port", 9000),
                    user=ck_config.get("user", "default"),
                    password=ck_config.get("password", ""),
                    database=ck_config.get("database", "default")
                )
                # 验证新连接
                clickhouse_client.execute('SELECT 1')
                log.info("ClickHouse重新连接成功")
            
            # ClickHouse插入设置
            ck_settings = {
                'max_insert_threads': 2,
                'insert_distributed_sync': 0,
                'async_insert': 1,
                'wait_for_async_insert': 0
            }
            
            # 保存数据到ClickHouse
            if data_type == "MRO":
                table_name = "LTE_MRO"
                # 检查数据非空且格式正确
                if data and len(data) > 0:
                    try:
                        # 获取列名
                        columns = ", ".join(data[0].keys())
                        # 构建SQL语句
                        sql = f"INSERT INTO {table_name} ({columns}) VALUES"
                        # 执行插入
                        clickhouse_client.execute(sql, data, settings=ck_settings)
                        log.info(f"成功插入MRO数据到ClickHouse，记录数: {len(data)}")
                    except Exception as e:
                        log.error(f"插入MRO数据出错: {str(e)}")
                        raise  # 重新抛出异常，确保上层能够捕获并处理
            
            elif data_type == "MDT":
                table_name = "LTE_MDT"
                # 检查数据非空且格式正确
                if data and len(data) > 0:
                    try:
                        # 获取列名
                        columns = ", ".join(data[0].keys())
                        # 构建SQL语句
                        sql = f"INSERT INTO {table_name} ({columns}) VALUES"
                        # 执行插入
                        clickhouse_client.execute(sql, data, settings=ck_settings)
                        log.info(f"成功插入MDT数据到ClickHouse，记录数: {len(data)}")
                    except Exception as e:
                        log.error(f"插入MDT数据出错: {str(e)}")
                        raise  # 重新抛出异常，确保上层能够捕获并处理
            
            # 尝试更新任务状态为成功
            try:
                await server.task_update_status(file_hash, file_path, 2)
                log.info(f"成功更新任务状态: file_hash={file_hash}, status=2(成功)")
            except Exception as e:
                log.error(f"更新任务状态失败: {str(e)}")
                
            return True, ""
            
        except Exception as e:
            error_msg = f"ClickHouse操作失败: {str(e)}"
            log.error(error_msg)
            # 尝试更新任务状态为失败
            try:
                await server.task_update_status(file_hash, file_path, -2)
                log.info(f"任务状态已更新为失败: file_hash={file_hash}, status=-2(失败)")
            except Exception as update_err:
                log.error(f"更新任务状态失败: {str(update_err)}")
            # 重置连接，下次会重新创建
            clickhouse_client = None
            return False, error_msg

async def process_in_pool(pool, task_params):
    """
    在进程池中处理任务
    """
    global clickhouse_client, clickhouse_lock, server
    
    try:
        # 提取必要的变量
        task_data = task_params["task_data"]
        gateway_config = task_params["gateway_config"]
        database_config = task_params["database_config"]
        
        nds_id = task_data.get("ndsId")
        file_path = task_data.get("file_path")
        file_hash = task_data.get("file_hash")
        data_type = task_data.get("data_type", "").upper()
        header_offset = task_data.get("header_offset", 0)
        compress_size = task_data.get("compress_size")
        
        # 将任务委托给进程池工作函数
        process_params = (nds_id, file_path, data_type, gateway_config, file_hash, header_offset, compress_size)
        result = await pool.apply(process_worker_task, process_params)
        
        if not result:
            log.warning(f"任务处理没有返回结果: nds_id={nds_id}, path={file_path}")
            return
        
        # 解析返回结果
        status = result.get("status")
        results = result.get("data")
        error = result.get("error")
        processing_time = result.get("processing_time", 0)
        
        # 处理任务结果
        if status == "success":
            # 将数据插入ClickHouse
            for data in results:
                if data:
                    success, error_msg = await insert_data_to_clickhouse(data, data_type, file_hash, file_path, database_config)
                else:
                    await server.task_update_status(file_hash, file_path, 2)
                    success = True
                if success:
                    log.info(f"数据处理完成，类型: {data_type}, 结果尺寸: {len(data)}, 耗时: {processing_time:.2f}秒")
                else:
                    log.error(f"数据插入失败: {error_msg}")
        
        else:
            # 尝试更新任务状态为失败
            try:
                await server.task_update_status(file_hash, file_path, -2)
            except Exception as update_err:
                log.error(f"更新任务状态失败: {str(update_err)}")
            log.error(f"任务处理失败: {error}")
        
    except Exception as e:
        log.error(f"处理任务时发生未知错误: {str(e)}")
        # 尝试更新任务状态为失败
        try:
            if file_hash and file_path:
                await server.task_update_status(file_hash, file_path, -2)
                log.info(f"任务状态已更新为系统错误: file_hash={file_hash}, status=-2(失败)")
        except Exception as update_err:
            log.error(f"更新任务状态失败: {str(update_err)}")

# 进程池工作函数，在子进程中执行
async def process_worker_task(nds_id, file_path, data_type, gateway_config, file_hash=None, header_offset=0, compress_size=None):
    """
    工作进程中的任务处理函数，负责获取数据和解析
    """
    if not data_type or data_type not in ["MRO", "MDT"]:
        return {"status": "error", "error": f"未知的数据类型: {data_type}"}
    start_time = time.time()
    try:
        # 在子进程中创建Gateway实例
        gateway = Gateway(gateway_config.get("host"), gateway_config.get("port"))
        
        # 读取文件数据，传入必要的header_offset和compress_size参数
        file_data = await gateway.ws_read_file(nds_id, file_path, header_offset, compress_size)
        
        if not file_data:
            return {"status": "error", "error": f"读取文件失败: nds_id={nds_id}, path={file_path}" }
        
        results = []
        with zipfile.ZipFile(io.BytesIO(file_data)) as zip_file:
            files = [f for f in zip_file.namelist() if f.lower().endswith(file_suffix)]
            for file in files:
                with zip_file.open(file) as f:
                    data = f.read()
                    if len(data) > 128:
                        if data_type == "MRO":
                            result = mro(data)
                        elif data_type == "MDT":
                            result = mdt(data)
                        results.extend(result)
        processing_time = time.time() - start_time
        
        return {"status": "success", "data": results, "processing_time": processing_time}
        
    except ParseError as e:
        return {"status": "error", "error": f"解析{data_type}数据({file_hash})失败: {str(e)}", "processing_time": time.time() - start_time}
    except Exception as e:
        return {"status": "error", "error": f"处理{data_type}数据时发生未知错误: {str(e)}", "processing_time": time.time() - start_time}