import asyncio
import io
import json
import signal
import zipfile
from multiprocessing import Manager
from typing import List

from aiomultiprocess import Process
from clickhouse_driver import Client as CKClient

from app.core.config import settings
from app.core.parser import mro, mdt
from app.core.server import Server, Gateway


class LogModel:
    def __init__(self, level, message):
        self.level = level
        self.message = message


# noinspection PyTypeChecker
class TaskProcess:
    def __init__(self):
        self.process_count = 2
        self.task_queue = Manager().Queue()
        self.idle_queue = Manager().Queue()
        self.task_update_queue = Manager().Queue()
        self.status = Manager().dict()
        self.status_lock = Manager().Lock()
        self.is_running = False
        self.processes: List[Process] = []
        self._shutdown_event = Manager().Event()
        self.ck_config = {}
        self.server = Server()
        self.gateway: Gateway = None
        self._lock = asyncio.Lock()
        self.config = None
        self.gateway_url = None

    async def init(self):
        # 获取解析器配置，检测网关是否启动
            config = await self.server.get_parser_config(settings.NODE_ID)
            if not config:
                self.is_running = False
                return None
            
            gateway_config = config.get("GatewayConfig")
            
            if not (gateway_config.get("Host") and gateway_config.get("Port")):
                self.is_running = False
                return None

            # noinspection HttpUrlsUsage
            self.gateway_url = f"http://{gateway_config.get('Host')}:{gateway_config.get('Port')}"
            
            self.gateway = Gateway(self.gateway_url)
            res = await self.gateway.get_service_status()
            if not res or res.code != 200 or res.data.get("status", "stopped") != "running":
                self.is_running = False
                return None
            
            parser_config = config.get("parserConfig")
            if not (parser_config.get("Host") and parser_config.get("Port")):
                self.is_running = False
                return None
            self.process_count = parser_config.get("Threads", 2)
            ck_config = config.get("ClickhouseConfig")
            if not (ck_config and ck_config.get("host") and ck_config.get("port")):
                self.is_running = False
                return None
            # 检查ClickHouse连接
            try:
                clickhouse = CKClient(
                    host=ck_config["host"],
                    port=ck_config["port"],
                    user=ck_config["user"],
                    password=ck_config["password"],
                    database=ck_config["database"]
                )
                clickhouse.execute('SELECT 1')
            except Exception:
                self.is_running = False
                return None
            self.ck_config = ck_config

            self.config = config
    
    async def start(self):
        async with self._lock:
            if self.is_running:
                return None
            self.is_running = True
            
            self._shutdown_event.clear()
            with self.status_lock:
                self.status['process_count'] = self.process_count
                for pid in range(self.process_count):
                    self.status[f'P{pid}_Active'] = False

            self.processes = [
                Process(
                    target=sub_process,
                    args=(
                        pid, self.task_queue, self.idle_queue, settings.BACKEND_URL, self.status, self.status_lock,
                        self._shutdown_event, self.ck_config, self.gateway_url
                    )
                ) for pid in range(self.process_count)
            ]
            for process in self.processes:
                process.start()
            


    async def stop(self):
        """停止所有进程"""
        async with self._lock:
            if not self.is_running:
                return
            self._shutdown_event.set()
            self.is_running = False
            # 向队列发送停止信号
            for _ in range(len(self.processes)):
                self.task_queue.put_nowait(None)
            # while not (self.task_queue.empty() and self.task_update_queue.empty()):
            #     await asyncio.sleep(1)
            # 等待所有进程完成
            for process in self.processes:
                await process.join()
            self.processes.clear()
            
    @property
    def idle_process_count(self) -> int:
        """获取空闲进程数量"""
        idle_count = 0
        with self.status_lock:
            for pid in range(self.process_count):
                if not self.status[f'P{pid}_Active']:
                    idle_count += 1
        return idle_count


# noinspection PyBroadException
async def sub_process(pid, task_queue, idle_queue, server_url, status, lock, shutdown_event, ck_config, gateway_url):
    """子进程的主函数"""
    signal.signal(signal.SIGINT, signal.SIG_IGN)
    signal.signal(signal.SIGTERM, signal.SIG_IGN)
    run = True
    server = Server(server_url)
    try:
        clickhouse = CKClient(
            host=ck_config["host"],
            port=ck_config["port"],
            user=ck_config["user"],
            password=ck_config["password"],
            database=ck_config["database"]
        )
        clickhouse.execute('SELECT 1')
    except Exception:
        return
    print(f"SubProcess[{pid}]: Started")
    gateway = Gateway(gateway_url)
    while run:
        try:
            if shutdown_event.is_set():
                run = False
                break

            with lock:
                status[f'P{pid}_Active'] = False

            try:
                task = task_queue.get_nowait()  # 先尝试非阻塞获取任务
            except Exception:
                idle_queue.put(pid)  # 通知主进程该进程空闲
                task = task_queue.get()  # 阻塞等待任务

            if task is None:  # 停止信号
                break

            with lock:
                status[f'P{pid}_Active'] = True
            await parse_task(gateway, task, clickhouse, server)

        except Exception as e:
            with lock:
                status[f'P{pid}_Active'] = False


    clickhouse.disconnect()

# noinspection PyBroadException
async def update_status(server: Server, file_hash: str, value: int):
    """添加更新任务状态队列"""
    try:
        await server.update_nds_file_parsed({"FileHash": file_hash, "Parsed": value})
    except Exception:
        pass


# noinspection HttpUrlsUsage,PyBroadException,SqlDialectInspection,SqlNoDataSourceInspection
async def parse_task(gateway, task_data, clickhouse, server):
    """处理单个任务的协程"""
    try:
        # 数据库配置
        ck_set = {
            'max_insert_threads': 2,
            'insert_distributed_sync': 0,
            'async_insert': 1,
            'wait_for_async_insert': 0
        }

        # 任务类型配置
        task_type = task_data.get("DataType", "").upper()
        
        config = {
            "MRO": (".xml", "LTE_MRO", mro),
            "MDT": (".csv", "LTE_MDT", mdt)
        }.get(task_type)
        
        if not config:
            raise ValueError("Invalid task type")

        file_suffix, table_name, parser_func = config

        # 获取并处理文件
        file_data = await gateway.read_file_with_ws(
            task_data["NDSID"],
            task_data["FilePath"],
            task_data.get("HeaderOffset", 0),
            task_data.get("CompressSize")
        )
        if not file_data:
            raise ValueError("Empty file data")

        with zipfile.ZipFile(io.BytesIO(file_data)) as zip_file:
            data_files = [f for f in zip_file.namelist() if f.lower().endswith(file_suffix)]
            for data_file in data_files:
                with zip_file.open(data_file) as f:
                    data = f.read()
                    try:
                        for res in parser_func(data):
                            if res:
                                sql = f"INSERT INTO {table_name} ({', '.join(res[0].keys())}) VALUES"
                                clickhouse.execute(sql, res, settings=ck_set)
                        await update_status(server, task_data["FileHash"], 3)  # 成功
                    except Exception:
                        await update_status(server, task_data["FileHash"], -2)  # 解析失败

    except zipfile.BadZipFile:
        await update_status(server, task_data["FileHash"], -2)
    except Exception as e:
        try:
            error_data = json.loads(str(e)) if isinstance(str(e), str) else e
            status = -1 if error_data.get("code") == 404 else -2
        except Exception:
            status = -2
        await update_status(server, task_data["FileHash"], status)

