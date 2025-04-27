import json
import uuid
import websockets
import asyncio
from app.core.config import config
from app.core.http_client import HttpClient, HttpConfig
from app.core.logger import log


class Server:
    def __init__(self):
        self.server = HttpClient(
            f"{config.get('server.protocol')}://{config.get('server.host')}:{config.get('server.port')}/api/",
            config=HttpConfig(timeout=config.get("server.timeout", 3600))
        )
        self.id = config.get("app.id")
    
    async def register(self):
        response = await self.server.post("parser/register", json={
            "id": config.get("app.id"),
            "port": config.get("app.port"),
        })
        if response.get("code") == 200:
            return response.get("data")
        else:
            raise Exception(f"注册失败: {json.dumps(response, ensure_ascii=False)}")
        
    async def unregister(self):
        response = await self.server.put(f"parser/{config.get('app.id')}", json={ "status": 0 })
        if response.get("code") == 200:
            return response.get("data")
        else:
            raise Exception(f"注销失败: {json.dumps(response, ensure_ascii=False)}")
        
    async def get_parser_info(self):
        response = await self.server.get(f"parser/{config.get('app.id')}")
        log.info(f"获取到Parser信息: {json.dumps(response, ensure_ascii=False)}")
        if response.get("code") == 200:
            return response.get("data")
        else:
            raise Exception(f"获取节点配置失败: {json.dumps(response, ensure_ascii=False)}")
        
    async def get_database_info(self):
        response = await self.server.get(f"config/get")
        if response.get("code") == 200:
            return response.get("data")
        else:
            raise Exception(f"获取数据库配置失败: {json.dumps(response, ensure_ascii=False)}")
        
    async def task_update_status(self, file_hash, file_path, status):
        response = await self.server.post(f"ndsfiles/updateTaskStatus", json={
            "file_hash": file_hash,
            "file_path": file_path,
            "status": status
        })
        if response.get("code") == 200:
            return response.get("data")
        else:
            raise Exception(f"更新任务状态失败: {json.dumps(response, ensure_ascii=False)}")

class Gateway:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.url = f"http://{host}:{port}"
        # WebSocket的URL需要与Gateway的API路由匹配
        self.ws_url = f"ws://{host}:{port}/v1/nds/ws"
        self.client = HttpClient(self.url)
    
    async def ws_read_file(self, ndsid, path, header_offset=0, compress_size=None):
        """
        使用WebSocket从NDS服务器读取文件数据
        :param ndsid: NDS服务器ID
        :param path: 文件路径
        :param header_offset: 文件头偏移量，默认为0
        :param compress_size: 压缩大小，默认为None
        :return: 文件数据的字节数组
        """
        try:
            # 生成唯一的客户端ID用于WebSocket连接
            client_id = str(uuid.uuid4())
            # 构建WebSocket连接URL
            ws_endpoint = f"{self.ws_url}/{client_id}"
            
            # 创建WebSocket连接
            async with websockets.connect(ws_endpoint, max_size=2 ** 30) as websocket:  # 设置最大消息大小为1GB
                # 构建请求参数
                request_id = str(uuid.uuid4())
                request_data = {
                    "api": "read",
                    "request_id": request_id,
                    "params": {
                        "nds_id": ndsid,
                        "path": path,
                        "header_offset": header_offset,
                        "size": compress_size if compress_size is not None else 0
                    }
                }
                
                # 发送请求
                await websocket.send(json.dumps(request_data))
                
                # 接收文件数据
                file_data = bytearray()
                
                while True:
                    # 接收数据
                    data = await websocket.recv()
                    
                    # 如果是字符串，可能是JSON响应
                    if isinstance(data, str):
                        try:
                            json_data = json.loads(data)
                            # 检查是否为结束标记或错误信息
                            if json_data.get("type") == "file" and json_data.get("data") == "end":
                                break
                            elif json_data.get("type") == "error":
                                raise Exception(json.dumps(json_data))
                        except json.JSONDecodeError:
                            log.error(f"无法解析响应: {data}")
                            continue
                    # 如果是二进制数据，添加到文件数据中
                    elif isinstance(data, bytes):
                        file_data.extend(data)
                return file_data
                
        except Exception as e:
            log.error(f"读取文件失败: {str(e)}")
            return None