import json

from app.core.http_client import HttpClient
from app.core.config import settings
from typing import TypeVar, Generic, Optional
from pydantic import BaseModel
from datetime import datetime
from app.logs.log_service import log_service
import websockets
import uuid


T = TypeVar('T')

class ResponseModel(BaseModel, Generic[T]):
    """统一的响应模型"""
    code: int = 200
    message: str = "success"
    data: Optional[T] = None
    timestamp: int = int(datetime.now().timestamp())


# noinspection PyBroadException
class Server:
    def __init__(self, backend_url: str = settings.BACKEND_URL):
        self.http_client = HttpClient(backend_url)
    
    async def close(self):
        try:
            await self.http_client.close()
        except Exception:
            pass
    
    async def register_node(self):
        try:
            res = await self.http_client.post(
                "server/node/register",
                json={
                    "ID": settings.NODE_ID,
                    "NodeType": settings.NODE_TYPE,
                    "NodeName": settings.NODE_NAME,
                    "Host": settings.HOST,
                    "Port": settings.PORT,
                    "Status": "Online"
                },
                timeout=30
            )
            return res
        except Exception:
            return None
    
    async def unregister_node(self):
        try:
            res = await self.http_client.post(
                "server/node/unregister",
                json={
                    "NodeType": settings.NODE_TYPE,
                    "ID": settings.NODE_ID,
                    "Status": "Offline"
                },
                timeout=30
            )
            if res.get("code") != 200:
                return False
            return True
        except Exception:
            return False
    
    async def check_backend(self):
        try:
            res = await self.http_client.get("/", timeout=30)
            if res.get("code") != 200:
                return False
            return True
        except Exception:
            return False
    
    async def get_gateway_nds_servers(self):
        try:
            res = await self.http_client.post(
                "server/node/get-gateway-nds",
                json={
                    "GatewayID": settings.NODE_ID
                },
                timeout=30
            )
            if res.get("code") != 200:
                log_service.error(f"Failed to Get Gateway NDS list: {res.get('message')}")    
                return None
            return res.get("data")
        except Exception as e:
            log_service.error(f"Failed to Get Gateway NDS list: {e}")
            return None

    async def get_nds_files(self, nds_id: str):
        """获取NDS文件列表
        
        Args:
            nds_id: NDS服务器ID
        """
        try:
            res = await self.http_client.get(
                "server/ndsfile/files",
                params={"nds_id": nds_id},
                timeout=3600
            )
            if res.get("code") != 200:
                log_service.error(f"Failed to get NDS file list: {res.get('message')}")
                return None
            return res.get("data")
        except Exception as e:
            log_service.error(f"Failed to get NDS file list: {e}")
            return None
            
    async def remove_nds_files(self, nds_id: str, files: list):
        """删除NDS文件
        
        Args:
            nds_id: NDS服务器ID
            files: 要删除的文件列表
        """
        try:
            res = await self.http_client.post(
                "server/ndsfile/remove",
                json={
                    "nds_id": nds_id,
                    "files": files
                },
                timeout=3600
            )
            if res.get("code") != 200:
                log_service.error(f"Failed to remove NDS files: {res.get('message')}")
                return None
            return res.get("data")
        except Exception as e:
            log_service.error(f"Failed to remove NDS files: {e}")
            return None
            
    async def update_nds_file_parsed(self, files: list):
        """更新文件解析状态
        
        Args:
            files: 文件列表，每个文件包含 FileHash 和 Parsed 字段
        """
        try:
            res = await self.http_client.post(
                "server/ndsfile/update-parsed",
                json={"files": files},
                timeout=3600
            )
            if res.get("code") != 200:
                log_service.error(f"Failed to update NDS file status: {res.get('message')}")
                return False
            return True
        except Exception as e:
            log_service.error(f"Failed to update NDS file status: {e}")
            return False
            
    async def batch_add_nds_files(self, files: list):
        """批量添加NDS文件记录
        
        Args:
            files: 文件记录列表，每个记录包含必要的文件信息
        """
        try:
            res = await self.http_client.post(
                "server/ndsfile/batch",
                json={"files": files},
                timeout=3600
            )
            if res.get("code") != 200:
                log_service.error(f"Failed to batch add NDS files: {res.get('message')}")
                return None
            return res.get("data")
        except Exception as e:
            log_service.error(f"Failed to batch add NDS files: {e}")
            return None
            
    async def replenish_task_queue(self):
        """补充任务队列"""
        try:
            res = await self.http_client.get(
                "server/ndsfile/replenish-tasks",
                timeout=30
            )
            if res.get("code") != 200:
                log_service.error(f"Failed to replenish task queue: {res.get('message')}")
                return False
            return True
        except Exception as e:
            log_service.error(f"Failed to replenish task queue: {e}")
            return False
            
    async def get_nds_server(self, nds_id: str):
        """获取NDS服务器配置
        
        Args:
            nds_id: NDS服务器ID
        """
        try:
            res = await self.http_client.get(
                "server/nds/get-nds-server",
                params={"ID": nds_id},
                timeout=30
            )
            if res.get("code") != 200:
                log_service.error(f"Failed to get NDS server: {res.get('message')}")
                return None
            return res.get("data")
        except Exception as e:
            log_service.error(f"Failed to get NDS server: {e}")
            return None
            
    async def get_node_config(self, node_type: str, node_id: int):
        """获取节点配置
        
        Args:
            node_type: 节点类型
            node_id: 节点ID
        """
        try:
            res = await self.http_client.post(
                "server/node/config",
                json={
                    "NodeType": node_type,
                    "ID": node_id
                },
                timeout=30
            )
            if res.get("code") != 200:
                log_service.error(f"Failed to get node config: {res.get('message')}")
                return None
            return res.get("data")
        except Exception as e:
            log_service.error(f"Failed to get node config: {e}")
            return None
            
    async def get_scanner_nds_servers(self, scanner_id: int):
        """获取扫描器对应的NDS服务器列表
        
        Args:
            scanner_id: 扫描器ID
        """
        try:
            res = await self.http_client.post(
                "server/node/get-scanner-nds",
                json={
                    "ScannerID": scanner_id
                },
                timeout=30
            )
            if res.get("code") != 200:
                log_service.error(f"Failed to get scanner NDS list: {res.get('message')}")
                return None
            return res.get("data")
        except Exception as e:
            log_service.error(f"Failed to get scanner NDS list: {e}")
            return None
            
    async def get_parser_config(self, parser_id: int):
        """获取解析器配置
        
        Args:
            parser_id: 解析器ID
        """
        try:
            res = await self.http_client.post(
                "server/node/get-parser-config",
                json={
                    "ParserID": parser_id
                },
                timeout=30
            )
            if res.get("code") != 200:
                log_service.error(f"Failed to get parser config: {res.get('message')}")
                return None
            return res.get("data")
        except Exception as e:
            log_service.error(f"Failed to get parser config: {e}")
            return None


# noinspection HttpUrlsUsage,PyBroadException
class Gateway:
    def __init__(self, gateway_url: str):
        self.http_client = HttpClient(gateway_url)
        self._gateway_url = gateway_url
    
    async def close(self):
        try:
            await self.http_client.close()
        except Exception:
            pass

    async def check_nds_connection(self, config: dict) -> ResponseModel:
        """检查NDS连接配置是否可用
        
        Args:
            config: NDS配置信息
                - Protocol: 协议类型 (FTP/SFTP)
                - Address: 服务器地址
                - Port: 端口号
                - Account: 账号
                - Password: 密码
        """
        try:
            res = await self.http_client.post(
                "gateway/nds/check",
                json=config,
                timeout=30
            )
            return ResponseModel(
                code=res.get("code", 200),
                message=res.get("message", "success"),
                data=res.get("data")
            )
        except Exception as e:
            log_service.error(f"检查NDS连接失败: {e}")
            return ResponseModel(
                code=500,
                message="Internal server error",
                data={"error": str(e)}
            )

    async def scan_files(self, nds_id: str, scan_path: str, filter_pattern: str = None) -> ResponseModel:
        """扫描NDS服务器上的文件
        
        Args:
            nds_id: NDS服务器ID
            scan_path: 要扫描的路径
            filter_pattern: 文件过滤模式（如: *.zip）
        """
        try:
            res = await self.http_client.post(
                "gateway/nds/scan",
                json={
                    "nds_id": nds_id,
                    "scan_path": scan_path,
                    "filter_pattern": filter_pattern
                },
                timeout=3600
            )
            return ResponseModel(
                code=res.get("code", 200),
                message=res.get("message", "success"),
                data=res.get("data")
            )
        except Exception as e:
            log_service.error(f"扫描文件失败: {e}")
            return ResponseModel(
                code=500,
                message="Internal server error",
                data={"error": str(e)}
            )

    async def get_zip_info(self, nds_id: str, file_paths: list) -> ResponseModel:
        """获取ZIP文件的信息
        
        Args:
            nds_id: NDS服务器ID
            file_paths: ZIP文件路径列表
        """
        try:
            res = await self.http_client.post(
                "gateway/nds/zip-info",
                json={
                    "nds_id": nds_id,
                    "file_paths": file_paths
                },
                timeout=3600
            )
            return ResponseModel(
                code=res.get("code", 200),
                message=res.get("message", "success"),
                data=res.get("data")
            )
        except Exception as e:
            log_service.error(f"获取ZIP信息失败: {e}")
            return ResponseModel(
                code=500,
                message="Internal server error",
                data={"error": str(e)}
            )

    async def read_file(self, nds_id: int, file_path: str, header_offset: int = 0, compress_size: int = None) -> bytes:
        """读取NDS文件内容
        
        Args:
            nds_id: NDS服务器ID
            file_path: 文件路径
            header_offset: 文件头偏移量（可选，默认0）
            compress_size: 要读取的字节数（可选，默认读取到文件末尾）
        """
        try:
            res = await self.http_client.post(
                "gateway/nds/read",
                json={
                    "NDSID": nds_id,
                    "FilePath": file_path,
                    "HeaderOffset": header_offset,
                    "CompressSize": compress_size
                },
                timeout=3600
            )
            return res
        except Exception as e:
            log_service.error(f"读取文件失败: {e}")
            raise

    async def get_service_status(self) -> ResponseModel:
        """获取NDS网关服务状态"""
        try:
            res = await self.http_client.get(
                "gateway/control/status",
                timeout=30
            )
            return ResponseModel(
                code=res.get("code", 200),
                message=res.get("message", "success"),
                data=res.get("data")
            )
        except Exception as e:
            log_service.error(f"获取服务状态失败: {e}")
            return ResponseModel(
                code=500,
                message="Internal server error",
                data={"error": str(e)}
            )
    
    async def read_file_with_ws(self, nds_id: int, file_path: str, header_offset: int = 0, compress_size: int = None):
        try:
            ws_url = f"ws://{self._gateway_url.replace('http://', '')}/gateway/nds/ws/read/{uuid.uuid4()}"
            async with websockets.connect(ws_url, max_size=2 ** 30) as websocket:  # 设置最大消息大小为2GB(2 ** 30 = 1073741824 字节)
                await websocket.send(json.dumps({
                    "NDSID": nds_id,
                    "FilePath": file_path,
                    "HeaderOffset": header_offset,
                    "CompressSize": compress_size
                }))

                file_data = bytearray()
                while True:
                    data = await websocket.recv()
                    if isinstance(data, str):
                        json_data = json.loads(data)
                        if json_data.get("end_of_file"):
                            break
                        if "code" in json_data:
                            raise Exception(json.dumps(json_data))
                    else:
                        file_data.extend(data)
            if not file_data:
                log_service.error(f"读取NDS[{nds_id}]文件({file_path})失败: 文件内容为空")
                return None
            return file_data
        except Exception as e:
            log_service.error(f"读取NDS[{nds_id}]文件({file_path})失败: {e}")
            return None