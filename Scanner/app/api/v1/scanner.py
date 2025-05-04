from fastapi import APIRouter
from app.api.deps import response_wrapper
from app.core.scanner import start, stop, status


api_router = APIRouter(tags=["Scanner API"])

@api_router.get("/control/start")
@response_wrapper
async def control_start():
    """
    启动Scanner
    """
    return await start()

@api_router.get("/control/stop")
@response_wrapper
async def control_stop():
    """
    停止Scanner
    """
    return await stop()

@api_router.get("/control/status")
@response_wrapper
async def control_status():
    """
    获取Scanner状态
    """
    return await status()
