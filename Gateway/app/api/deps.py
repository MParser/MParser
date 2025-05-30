import uuid
from enum import Enum
from functools import wraps
from typing import Callable
from app.core.errors import *
from pydantic import BaseModel
from app.schemas.response import ResponseModel


def generate_request_id() -> str:
    """生成请求ID"""
    return str(uuid.uuid4())

def response_wrapper(func: Callable) -> Callable:
    """响应包装器"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            # 执行原函数
            result = await func(*args, **kwargs)
            
            # 如果返回的已经是ResponseModel，直接返回其字典形式
            if isinstance(result, ResponseModel):
                return result.model_dump()
            
            # 成功响应
            return {
                "code": 200,
                "msg": "success",
                "data": result,
                "request_id": generate_request_id()
            }
            
        except AppError as e:
            # 统一处理所有AppError及其子类异常
            return {
                "code": e.error_code,
                "msg": e.error_msg,
                "data": e.error_detail,
                "request_id": generate_request_id()
            }
        except Exception as e:
            # 处理其他异常
            return {
                "code": 500,
                "msg": str(e),
                "data": None,
                "request_id": generate_request_id()
            }
    
    return wrapper

class WSMessageType(str, Enum):
    RESPONSE = "response"  # 普通响应
    FILE = "file"         # 文件传输
    CHECK = "check"       # 连接检查
    ERROR = "error"       # 错误响应


# noinspection PyPep8Naming
class WS_RESPONSE(BaseModel):
    type: WSMessageType = WSMessageType.RESPONSE
    code: int = 200
    from_api: Optional[str] = None
    nds_id: Optional[str] = None
    message: Optional[str] = None
    data: Optional[Any] = None
    request_id: Optional[str] = None

class ScanRequest(BaseModel):
    id: str
    path: str
    filter: Optional[str] = None
