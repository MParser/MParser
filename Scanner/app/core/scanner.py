from app.core.logger import log
from app.utils.server import Server
from app.core.errors import NotFoundError
from app.services.scanner import Scanner

server = Server()
scanner_instance = Scanner()

async def start():
    """启动扫描器并返回结果"""
    try:
        response = await server.info()
        if not response.get("gateway"):
            raise ValueError("未配置网关")
        if not response.get("ndsLinks") or response.get("ndsLinks") == []:
            raise ValueError("未配置NDS")
        gateway = response.get("gateway")
        if gateway is None:
            raise ValueError("网关信息为空")
        gateway_id = gateway.get("id")
        if gateway_id is None:
            raise ValueError("网关ID为空")
        gateway_nds = await server.gateway_nds(gateway_id)
        if not gateway_nds or gateway_nds == []:
            raise ValueError("绑定网关DNS清单为空, 无法启动扫描器")
        
        return await scanner_instance.start()
        
    except Exception as e:
        log.error(f"扫描器启动失败: {str(e)}")
        raise ValueError(f"扫描器启动失败: {str(e)}")

async def stop():
    """停止扫描器并返回结果"""
    return await scanner_instance.stop()

async def status():
    """获取扫描器状态"""
    return await scanner_instance.status()
