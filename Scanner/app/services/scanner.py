import json
from typing import Optional
import re
import asyncio
from datetime import datetime

from app.core.logger import log
from app.utils.server import Server, Gateway


server = Server()


class ResponseModel:
    def __init__(self, code: int = 200, data: dict = None, message: str = ""):
        self.code = code
        self.data = data
        self.message = message
    
    def __str__(self):
        return json.dumps(self.dict(), ensure_ascii=False)


class Scanner:
    """NDS文件扫描器
    
    负责扫描NDS服务器上的文件，解析文件信息并提交到后端数据库。
    支持NDS实例并发扫描，每个实例独立运行。
    """

    def __init__(self):
        self.running = False            # 运行标志
        self.stopping = False           # 停止中标志
        self.gateway = None             # 网关配置
        self.max_interval = 300         # 最大扫描间隔（秒）
        self.min_interval = 60          # 最小扫描间隔（秒）
        self._tasks = {}                # NDS扫描任务字典
        self._status = {                # 扫描器状态信息
            "running": False,           # 是否正在运行
            "stopping": False,          # 是否正在停止
            "tasks": {},                # 各NDS任务状态
            "start_time": None,         # 启动时间
            "last_scan": {}             # 上次扫描时间
        }
    
    def _extract_time(self, filename: str) -> Optional[str]:
        try:
            match = re.compile(r'[_-](\d{14})').search(filename)
            if match:
                time_str = match.group(1)
                # 解析时间字符串
                parsed_time = datetime.strptime(time_str, '%Y%m%d%H%M%S')
                # 转换为数据库格式
                return parsed_time.strftime('%Y-%m-%d %H:%M:%S')
        except Exception as e:
            log.warning(f"解析时间字符串失败: {str(e)}")
        return None
    
    async def scan_loop(self, nds_config):
        try:
            server = Server()
            await server.info()
            
            gateway = Gateway(self.gateway, f"Scanner-NDS-{nds_config.get('id')}")
            log.info(f"Scanner thread[{nds_config.get('id')}] started.")
            
            # 更新任务状态
            nds_id = nds_config.get('id')
            self._status["tasks"][str(nds_id)] = {
                "running": True,
                "last_scan": None,
                "files_processed": 0
            }
            
            while self.running and not self.stopping:
                try:
                    start_time = datetime.now()
                    self._status["tasks"][str(nds_id)]["last_scan"] = start_time.isoformat()
                
                    mro_new_files = []
                    await gateway.connect()
                    
                    mro_files_nds = await gateway.scan_nds(nds_config.get("id"), nds_config.get("MRO_Path"), nds_config.get("MRO_Filter"))
                    
                    if mro_files_nds.code == 200:
                        mro_new_files = await server.ndsfile_filter_files(nds_config.get("id"), "MRO", mro_files_nds.data)
                    else:
                        log.warning(f"Scanner thread[{nds_config.get('id')}] scan mro error: {mro_files_nds}")
                    
                    mdt_files_nds = await gateway.scan_nds(nds_config.get("id"), nds_config.get("MDT_Path"), nds_config.get("MDT_Filter"))
                    
                    if mdt_files_nds.code == 200:
                        mdt_new_files = await server.ndsfile_filter_files(nds_config.get("id"), "MDT", mdt_files_nds.data)
                    else:
                        log.warning(f"Scanner thread[{nds_config.get('id')}] scan mdt error: {mdt_files_nds}")
                    
                    
                    # 合并新文件并保留类型信息
                    new_files = [
                        *[{'path': path, 'type': 'MRO'} for path in mro_new_files],
                        *[{'path': path, 'type': 'MDT'} for path in mdt_new_files]
                    ]
                    
                    # 根据文件名中的时间从远到近（从旧到新）排序
                    new_files.sort(key=lambda x: self._extract_time(x['path']) or '0001-01-01 00:00:00')
                    
                    log.info(f"NDS[{nds_config.get('id')}] 扫描新文件数量: {len(new_files)}")
                    # 扫描新文件子包
                    nds_id = int(nds_config.get("id"))  # 提前获取ID
                    batch_data = []  # 存储待处理的数据
                    batch_size = 0  # 当前批次的数据大小
                    MAX_BATCH_SIZE = 10 * 1024 * 1024  # 10MB
                    
                    for file in new_files:
                        data = await gateway.zip_info(nds=nds_config.get("id"), path=file['path'])
                        log.info(f"扫描NDS[{nds_id}]子包文件: {file['path']}")
                        if data.code == 200:
                            # 批量添加ndsId和data_type
                            current_data = [{**item, 'ndsId': nds_id, 'data_type': file['type']} for item in data.data]
                            current_size = len(json.dumps(current_data).encode('utf-8'))
                            
                            # 如果当前批次加上新数据超过5MB，先处理当前批次
                            if batch_size + current_size > MAX_BATCH_SIZE and batch_data:
                                try:
                                    response = await server.batch_add_tasks(batch_data)
                                    if response.get('code') == 429:  # redis高负荷，暂停写入
                                        batch_data = []  # 清空未成功提交的数据
                                        batch_size = 0
                                        break
                                    elif response.get('code') == 200:
                                        log.info(f"批量添加文件成功: {response.get('data')}")
                                        # 成功提交后再重置批次数据
                                        batch_data = []
                                        batch_size = 0
                                    else:
                                        log.error(f"批量添加文件失败: {response.get('message')}")
                                        batch_data = []  # 提交失败也清空数据
                                        batch_size = 0
                                except Exception as e:
                                    log.error(f"批量添加文件失败: {str(e)}")
                                    batch_data = []
                                    batch_size = 0
                                
                            
                            # 添加新数据到批次
                            batch_data.extend(current_data)
                            batch_size += current_size
                            if self.stopping or not self.running:
                                break
                    
                    # 处理最后一批数据（如果有）
                    if batch_data:
                        try:
                            response = await server.batch_add_tasks(batch_data)
                            if response.get('code') == 200:
                                log.info(f"批量添加文件成功: {response.get('data')}")
                                self._status["tasks"][str(nds_id)]["files_processed"] += len(batch_data)
                            else:
                                log.error(f"批量添加文件失败: {response.get('message')}")
                        except Exception as e:
                            log.error(f"批量添加文件失败: {str(e)}")
                            
                except Exception as e:
                    log.error(f"扫描失败:{str(e)}")
                
                end_time = datetime.now()
                elapsed_time = (end_time - start_time).total_seconds()
                interval = max(self.min_interval, self.max_interval - elapsed_time)
                log.info(f"下次扫描倒计时: {interval}秒")
                
                # 使用循环检查stopping标志，而不是简单的睡眠
                sleep_start = datetime.now().timestamp()
                while datetime.now().timestamp() - sleep_start < interval:
                    if self.stopping:
                        break
                    await asyncio.sleep(1)  # 每秒检查一次stopping标志
                
            # 确保断开网关连接
            if gateway and await gateway.is_connected():
                try:
                    await gateway.disconnect()
                    log.info(f"Scanner thread[{nds_config.get('id')}] 已断开网关连接")
                except Exception as e:
                    log.error(f"断开网关连接失败: {str(e)}")
        
        except Exception as e:
            log.error(f"扫描器运行失败: {str(e)}")
            if str(nds_id) in self._status["tasks"]:
                self._status["tasks"][str(nds_id)]["running"] = False
                self._status["tasks"][str(nds_id)]["error"] = str(e)
    
    async def start(self):
        """启动扫描器"""
        # 如果正在停止中，不允许启动
        if self.stopping:
            raise ValueError("扫描器正在停止中，请稍后再试")
            
        if self.running:
            raise "扫描器已启动"
            
        self.running = True
        self.stopping = False
        self._status["running"] = True
        self._status["stopping"] = False
        self._status["start_time"] = datetime.now().isoformat()
        
        response = await server.info()
        if not response.get("gateway"):
            self.running = False
            self._status["running"] = False
            self._status["error"] = "未配置网关"
            raise ValueError("未配置网关")
        self.gateway = response.get("gateway")
        if not response.get("ndsLinks") or response.get("ndsLinks") == []:
            self.running = False
            self._status["running"] = False
            self._status["error"] = "未配置NDS"
            raise ValueError("未配置NDS")
        gateway_nds = await server.gateway_nds(response.get("gateway").get("id"))
        if not gateway_nds or gateway_nds == []:
            self.running = False
            self._status["running"] = False
            self._status["error"] = "绑定网关DNS清单为空，无法启动扫描器"
            raise ValueError("绑定网关DNS清单为空, 无法启动扫描器")
        
        ndsList = response.get("ndsLinks")
        try:
            self._tasks = {}  # 清空之前的任务
            self._status["tasks"] = {}  # 清空任务状态
            
            for config in ndsList:
                if not config.get("id", None):
                    continue
                nds_id = str(config.get("id"))
                self._tasks[nds_id] = asyncio.create_task(self.scan_loop(config.get("nds")))
                
            if self._tasks == {}:
                self.running = False
                self._status["running"] = False
                self._status["error"] = "无可用NDS"
                raise ValueError("无可用NDS")
                
            return "扫描器启动成功"
        except Exception as e:
            log.error(f"扫描器启动失败: {str(e)}")
            self.running = False
            self._status["running"] = False
            self._status["error"] = str(e)
            raise f"扫描器启动失败: {str(e)}"
    
    async def stop(self):
        """停止扫描器"""
        if not self.running:
            raise ValueError("扫描器未运行")
            
        if self.stopping:
            raise ValueError("扫描器正在停止中") 
            
        log.info("正在停止扫描器...")
        self.stopping = True
        self._status["stopping"] = True
        
        # 设置超时，确保不会永远等待
        try:
            # 等待所有任务自然结束
            for task_id, task in self._tasks.items():
                if not task.done():
                    try:
                        # 设置超时时间为10秒
                        await asyncio.wait_for(asyncio.shield(task), timeout=10)
                    except asyncio.TimeoutError:
                        log.warning(f"任务{task_id}停止超时，强制取消")
                    except Exception as e:
                        log.error(f"停止任务{task_id}时出错: {str(e)}")
            
            # 确保任务完成后才清理资源
            for task_id, task in self._tasks.items():
                try:
                    if not task.done():
                        task.cancel()
                except Exception as e:
                    log.error(f"取消任务{task_id}时出错: {str(e)}")
            
            # 清理状态
            self._tasks = {}
            self.running = False
            self.stopping = False
            self._status["running"] = False
            self._status["stopping"] = False
            
            log.info("扫描器已停止")
            return "扫描器已停止"
        except Exception as e:
            log.error(f"停止扫描器时出错: {str(e)}")
            # 确保即使出错也会更新状态
            self.running = False
            self.stopping = False
            self._status["running"] = False
            self._status["stopping"] = False
            raise ValueError(f"停止扫描器时出错: {str(e)}") 
    
    async def status(self):
        """获取扫描器状态"""
        # 更新活跃任务数
        active_tasks = 0
        for _, task in self._tasks.items():
            if not task.done():
                active_tasks += 1
        
        status = {
            "running": self.running,
            "stopping": self.stopping,
            "active_tasks": active_tasks,
            "total_tasks": len(self._tasks),
            **self._status
        }
        
        return status