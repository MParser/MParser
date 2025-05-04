import asyncio
import json
from typing import List
from redis.asyncio import Redis
from app.core.logger import log


class TaskQueue:
    def __init__(self, nds_ids:List[int], host: str, port: int, password: str='', db: int=0):
        self.nds_ids = nds_ids
        self.host = host
        self.port = port
        self.password = password
        self.db = db
        self._is_running = False
        self.queue_keys = [f"task_for_nds:{nds_id}" for nds_id in self.nds_ids]
    
    async def connect(self):
        try:
            self.redis = Redis(
                host=self.host,
                port=self.port,
                db=self.db,
                password=self.password,
                decode_responses=True,  # 自动解码响应内容
                socket_timeout=5,
                socket_connect_timeout=5,
                retry_on_timeout=True,
            )
            if await self.redis.ping():
                self._is_running = True
                return True
            else:
                raise Exception("Connect fail.")
        except Exception as e:
            log.error(f"Connect redis error:{e}")
            return False
        
    
    async def close(self):
        try:
            await self.redis.close()
        except Exception as e:
            log.error(f"Close redis error:{e}")
    
    
    async def pop_task(self, timeout=0):
        """
        从队列中阻塞式弹出任务，并动态调整队列优先级
        :return: task_data (dict) - JSON 解析后的任务数据
        """
        try:
            while self._is_running:
                # 从队列中阻塞式弹出任务
                try:
                    task = await self.redis.blpop(self.queue_keys, timeout=timeout)
                except TimeoutError:
                    task = None
                
                if task:
                    queue_name, raw_data = task
                    try:
                        # 尝试解析 JSON 数据
                        if isinstance(raw_data, bytes):
                            raw_data = raw_data.decode('utf-8')
                        task_data = json.loads(raw_data)
                    except json.JSONDecodeError as e:
                        log.error(f"Failed to parse task data as JSON: {e}")
                        task_data = {"error": "Invalid JSON data", "raw_data": raw_data}
                    except Exception as e:
                        log.error(f"Error processing task data: {e}")
                        task_data = {"error": str(e), "raw_data": raw_data}
                    
                    await self._adjust_queue_order(queue_name)
                    return task_data
                return None
        except Exception as e:
            log.error(f"Error during task popping: {e}")
            await asyncio.sleep(1)
            return None
    
    async def _adjust_queue_order(self, processed_queue: str):
        """
        动态调整队列优先级，将当前消费的[NDS ID]队列放到最后
        :param processed_queue: 刚被消费的队列名称
        """
        try:
            if processed_queue in self.queue_keys:
                # 将处理过的队列放到末尾
                self.queue_keys.remove(processed_queue)
                self.queue_keys.append(processed_queue)
        except Exception as e:
            log.error(f"Error adjusting queue order: {e}")