import asyncio
import random
from typing import Dict, Any
import dateutil.parser
from fastapi import APIRouter
from app.core.server import Server
from app.core.task_process import TaskProcess
from app.core.config import settings
from app.logs.log_service import log_service
from app.core.task_queue import TaskQueue

processor: TaskProcess = None

router = APIRouter(prefix="/parser", tags=["parser"])

server = Server()



async def get_task():
    """任务获取协程"""
    global processor
    task_queue = TaskQueue(
        nds_ids=processor.config.get('NDSIDs'), 
        host=processor.config.get('RedisConfig').get('host'), 
        port=processor.config.get('RedisConfig').get('port'),
        password=processor.config.get('RedisConfig').get('password'),
        db=processor.config.get('RedisConfig').get('db')
    )
    if not await task_queue.connect():
        raise Exception("Task queue connect error")
    while processor.is_running:
        try:
            print("等待空闲进程...")
            processor.idle_queue.get()
            print("等待任务")
            task = await task_queue.pop_task(timeout=random.randint(2, 6))
            if not task:
                await server.replenish_task_queue()
                task = await task_queue.pop_task()
            print("获得任务")
            if task:
                try:
                    # 转换数据类型
                    if isinstance(task.get("FileTime"), str):
                        task["FileTime"] = dateutil.parser.parse(task["FileTime"])
                except Exception:
                    pass
                processor.task_queue.put_nowait(task)    
        except Exception as e:
            log_service.error(f"获取任务失败: {e}")
            await asyncio.sleep(1)
    task_queue.close()
    log_service.info("Task Poster stoped.")




# noinspection PyBroadException
@router.get("/start")
async def start_processor():
    global processor
    try:
        if processor is not None and processor.is_running:
            return {
                "code": 200,
                "message": "程序已经启动"
            }
    except Exception:
        pass
    
    # 检测是否配备网关
    res = await server.get_node_config(settings.NODE_TYPE, settings.NODE_ID)
    if not res:
        return {
            "code": 500,
            "message": "无法获取节点配置"
        }
    if not res.get("GatewayID"):
        return {
            "code": 500,
            "message": "节点未配置网关"
        }
    processor = TaskProcess()
    await processor.init()
    await processor.start()
    if not processor.config:
        return {
            "code": 500,
            "message": "程序启动失败"
        }
    
    # 启动任务获取和更新协程
    asyncio.create_task(get_task())
    
    return {
        "code": 200,
        "message": "程序启动完成"
    }
    
    



@router.get("/stop")
async def shutdown_processor():
    """关闭任务处理器"""
    global processor
    if processor and processor.is_running:
        await processor.stop()
        if processor.is_running:
            return {"code": 500, "meassage": "程序未能正常关闭"}
        return {"code": 200, "meassage": "操作完成"}
    else:
        return {"code": 500, "meassage": "程序未启动"}


@router.get("/status")
async def get_status() -> Dict[str, Any]:
    """获取节点状态"""
    global processor
    if processor and processor.is_running:
        return {
            "code": 200,
            "data": {
                "process_running": processor.is_running,
                "node_type": settings.NODE_TYPE,
                "node_name": settings.NODE_NAME,
                "idle_process_count": processor.idle_process_count
            }
        }

    return {"code": 500, "meassage": "程序未启动"}
    
    