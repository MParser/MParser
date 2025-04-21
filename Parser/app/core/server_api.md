# API 文档

## 目录

1. [概述](#概述)
2. [API 接口](#api-接口)
   1. [NDS API](#nds-api)
      1. [获取 NDS 服务器配置](#获取-nds-服务器配置)：获取指定 ID 的 NDS 服务器配置信息。
   2. [日志 API](#日志-api)
      1. [获取日志文件列表](#获取日志文件列表)：列出所有可用的日志文件。
      2. [获取日志文件内容](#获取日志文件内容)：查看指定日志文件的内容。
      3. [清理日志](#清理日志)：删除过期的日志文件。
   3. [小区数据 API](#小区数据-api)
      1. [获取小区列表](#获取小区列表)：分页获取小区信息。
      2. [添加小区](#添加小区)：新增一个小区记录。
      3. [更新小区](#更新小区)：修改小区的属性信息。
      4. [删除小区](#删除小区)：根据 CGI 删除指定小区。
      5. [批量删除小区](#批量删除小区)：一次删除多个小区。
      6. [检查 CGI 是否存在](#检查-cgi-是否存在)：验证小区是否已存在。
      7. [导入 Excel 数据](#导入-excel-数据)：上传 Excel 文件批量导入小区数据。
      8. [导出 Excel 数据](#导出-excel-数据)：导出小区数据为 Excel 文件。
   4. [节点 API](#节点-api)
      1. [注册节点](#注册节点)：注册新的网关或解析节点。
      2. [注销节点](#注销节点)：将节点状态设置为离线。
      3. [获取节点配置](#获取节点配置)：获取节点的详细配置。
      4. [获取网关对应 NDS 服务器](#获取网关对应-nds-服务器)：获取与网关关联的 NDS 服务器信息。
      5. [获取扫描器对应 NDS 服务器](#获取扫描器对应-nds-服务器)：获取与扫描器关联的 NDS 服务器信息。
      6. [获取解析器配置](#获取解析器配置)：获取解析器的详细配置信息。
   5. [NDS 文件 API](#nds-文件-api)
      1. [获取文件列表](#获取文件列表)：获取 NDS 文件列表及时间信息。
      2. [删除文件](#删除文件)：删除指定的 NDS 文件。
      3. [更新文件解析状态](#更新文件解析状态)：更新文件的解析状态。
      4. [批量添加文件记录](#批量添加文件记录)：批量导入文件记录到数据库。
      5. [补充任务队列](#补充任务队列)：补充文件解析任务队列。
   6. [NDS网关 API](#NDS网关-api)
      1. [检查 NDS 连接](#检查-nds-连接)：检查 NDS 服务器连接状态。
      2. [更新连接池](#更新连接池)：更新 NDS 服务器连接池配置。
      3. [扫描文件](#扫描文件)：扫描指定目录下的文件。
      4. [获取连接池状态](#获取连接池状态)：获取 NDS 服务器连接池状态。
      5. [获取 ZIP 文件信息](#获取-zip-文件信息)：获取 ZIP 文件的详细信息。
      6. [读取文件](#读取文件)：读取指定文件的内容。
      7. [WebSocket 文件读取](#websocket-文件读取)：使用 WebSocket 读取文件内容。
   7. [NDS网关 服务控制 API](#NDS网关-服务控制-api)
      1. [停止服务](#停止服务)：停止网关服务。
      2. [启动服务](#启动服务)：启动网关服务。
      3. [获取服务状态](#获取服务状态)：获取网关服务状态。

## 概述

本文档提供系统中各 API 接口的详细说明，包括调用方法、参数及返回数据格式。所有接口都遵循统一的响应格式：

```json
{
    "code": 200,            // 状态码
    "message": "success",   // 提示信息
    "data": {},            // 数据内容
    "timestamp": 1671111111111 // 时间戳（UNIX时间）
}
```

### 并发限制说明

系统对某些接口实施了并发控制：
- 文件列表接口：32 并发
- 批量添加接口：32 并发
- 更新状态接口：32 并发
- 文件删除：3 个工作线程

### 错误码说明

- 200: 成功
- 400: 请求参数错误
- 404: 资源不存在
- 500: 服务器内部错误

## API 接口

### NDS API

#### 获取 NDS 服务器配置

- **方法**: GET
- **路径**: `/server/nds/get-nds-server`
- **查询参数**:
  - `ID` (string, 必填): NDS ID
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "ID": "123",
      "Config": "..."
    },
    "timestamp": 1671111111111
  }
  ```

### 日志 API

#### 获取日志文件列表

- **方法**: GET
- **路径**: `/logs/list`
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": [
      {
        "name": "log1.txt",
        "size": 12345,
        "createTime": "2024-01-01 10:00:00",
        "updateTime": "2024-01-01 12:00:00"
      }
    ],
    "timestamp": 1671111111111
  }
  ```

#### 获取日志文件内容

- **方法**: GET
- **路径**: `/logs/content`
- **查询参数**:
  - `filename` (string, 必填): 日志文件名
  - `limit` (number, 选填, 默认=100): 返回的日志条数
  - `level` (string, 选填): 日志级别过滤
  - `startTime` (string, 选填): 开始时间
  - `endTime` (string, 选填): 结束时间
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": [
      {
        "message": "Log entry",
        "timestamp": "2024-01-01 10:00:00",
        "level": "INFO"
      }
    ],
    "timestamp": 1671111111111
  }
  ```

#### 清理日志

- **方法**: DELETE
- **路径**: `/logs/clean`
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "日志清理成功",
    "timestamp": 1671111111111
  }
  ```

### 小区数据 API

#### 获取小区列表

- **方法**: GET
- **路径**: `/client/cell-data/list`
- **查询参数**:
  - `page` (number, 选填, 默认=1): 页码
  - `pageSize` (number, 选填, 默认=50): 每页条数
  - `field` (string, 选填): 搜索字段
  - `keyword` (string, 选填): 搜索关键词
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "total": 100,
      "list": [
        { "CGI": "123", "Latitude": 12.34, "Longitude": 56.78 }
      ]
    },
    "timestamp": 1671111111111
  }
  ```

#### 添加小区

- **方法**: POST
- **路径**: `/client/cell-data/add`
- **请求体**:
  ```json
  {
    "CGI": "123",
    "Latitude": 12.34,
    "Longitude": 56.78
  }
  ```
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "小区添加成功",
    "timestamp": 1671111111111
  }
  ```

#### 更新小区

- **方法**: POST
- **路径**: `/client/cell-data/update`
- **请求体**:
  ```json
  {
    "CGI": "123",
    "Latitude": 12.35
  }
  ```
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "小区更新成功",
    "timestamp": 1671111111111
  }
  ```

#### 删除小区

- **方法**: DELETE
- **路径**: `/client/cell-data/remove/:cgi`
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "小区删除成功",
    "timestamp": 1671111111111
  }
  ```

#### 批量删除小区

- **方法**: POST
- **路径**: `/client/cell-data/batch-delete`
- **请求体**:
  ```json
  {
    "cgis": ["123", "124"]
  }
  ```
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "批量删除成功",
    "data": { "deletedCount": 2 },
    "timestamp": 1671111111111
  }
  ```

#### 检查 CGI 是否存在

- **方法**: GET
- **路径**: `/client/cell-data/check/:cgi`
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": { "exists": true },
    "timestamp": 1671111111111
  }
  ```

#### 导入 Excel 数据

- **方法**: POST
- **路径**: `/client/cell-data/upload`
- **请求体**: Multipart/form-data，包含 Excel 文件
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "文件处理成功",
    "data": {
      "total": 100,
      "inserted": 90,
      "updated": 10
    },
    "timestamp": 1671111111111
  }
  ```

#### 导出 Excel 数据

- **方法**: GET
- **路径**: `/client/cell-data/export`
- **返回**: 二进制 Excel 文件下载

### 节点 API

#### 注册节点

- **方法**: POST
- **路径**: `/server/node/register`
- **请求体**:
  ```json
  {
    "ID": "123",           // 可选，如果提供且>0则使用ID更新
    "NodeType": "NDSGateway", // 必填，节点类型：NDSGateway/NDSScanner/ParserNode
    "NodeName": "Gateway-1", // 必填
    "Host": "192.168.1.2",   // 必填
    "Port": 8080,            // 必填
    "Status": "online"       // 必填，online/offline
  }
  ```
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "节点注册成功",
    "data": {
      "ID": 123,
      "Switch": 0
    },
    "timestamp": 1671111111111
  }
  ```

#### 注销节点

- **方法**: POST
- **路径**: `/server/node/unregister`
- **请求体**:
  ```json
  {
    "NodeType": "NDSGateway", // 必填
    "ID": 123                 // 必填
  }
  ```
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "节点注销成功",
    "timestamp": 1671111111111
  }
  ```

#### 获取节点配置

- **方法**: POST
- **路径**: `/server/node/config`
- **请求体**:
  ```json
  {
    "NodeType": "NDSGateway", // 必填
    "ID": 123                 // 必填
  }
  ```
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "ID": 123,
      "NodeName": "Gateway-1",
      "Host": "192.168.1.2",
      "Port": 8080,
      "Status": 1,
      "Switch": 1
    },
    "timestamp": 1671111111111
  }
  ```

#### 获取网关对应 NDS 服务器

- **方法**: POST
- **路径**: `/server/node/gateway/nds`
- **请求体**:
  ```json
  {
    "GatewayID": "123"
  }
  ```
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "NDSID": "456",
      "NDSName": "NDS-Server-1"
    },
    "timestamp": 1671111111111
  }
  ```

#### 获取扫描器对应 NDS 服务器

- **方法**: POST
- **路径**: `/server/node/scanner/nds`
- **请求体**:
  ```json
  {
    "ScannerID": "123"
  }
  ```
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "NDSID": "456",
      "NDSName": "NDS-Server-1"
    },
    "timestamp": 1671111111111
  }
  ```

#### 获取解析器配置

- **方法**: POST
- **路径**: `/server/node/get-parser-config`
- **请求体**:
  ```json
  {
    "ParserID": "123"  // 必填，解析器节点ID
  }
  ```
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "获取解析器配置成功",
    "data": {
      "GatewayID": "456",              // 网关ID
      "GatewayConfig": {               // 网关配置信息
        "ID": "456",
        "NodeName": "Gateway-1",
        "Host": "192.168.1.1",
        "Port": 8080,
        "Status": 1,
        "Switch": 1
      },
      "NDSIDs": ["789", "790"],        // 关联的NDS服务器ID列表
      "RedisConfig": {                  // Redis配置信息
        "host": "localhost",
        "port": 6379,
        "password": "",
        "db": 0
      },
      "parserConfig": {                 // 解析器节点配置
        "ID": "123",
        "NodeName": "Parser-1",
        "Host": "192.168.1.2",
        "Port": 8081,
        "Status": 1,
        "Switch": 1,
        "GatewayID": "456"
      },
      "ClickhouseConfig": {             // Clickhouse配置信息
        "host": "localhost",
        "port": 9000,
        "username": "default",
        "password": "",
        "database": "default"
      }
    },
    "timestamp": 1671111111111
  }
  ```
- **错误响应**:
  ```json
  {
    "code": 400,
    "message": "参数错误：缺少ParserID",
    "timestamp": 1671111111111
  }
  ```
  ```json
  {
    "code": 404,
    "message": "解析器节点不存在",
    "timestamp": 1671111111111
  }
  ```
  ```json
  {
    "code": 400,
    "message": "未配置网关ID",
    "timestamp": 1671111111111
  }
  ```
  ```json
  {
    "code": 404,
    "message": "网关配置不存在",
    "timestamp": 1671111111111
  }
  ```

### NDS 文件 API

#### 获取文件列表

- **方法**: GET
- **路径**: `/server/ndsfile/files`
- **查询参数**:
  - `nds_id` (number, 必填): NDS 服务器 ID
- **并发限制**: 32
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "files": [
        {
          "FileHash": "abc123",
          "FilePath": "/mro/file1.gz",
          "FileTime": "2024-01-01 10:00:00",
          "Status": 0
        }
      ],
      "lastTime": "2024-01-01 10:00:00"
    },
    "timestamp": 1671111111111
  }
  ```

#### 删除文件

- **方法**: POST
- **路径**: `/server/ndsfile/remove`
- **并发限制**: 由 RemoveTaskManager 控制，最大3个工作线程
- **请求体**:
  ```json
  {
    "nds_id": "123",
    "files": ["/path/to/file1", "/path/to/file2"]
  }
  ```
- **并发限制**: 3个工作线程
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "taskId": "task_123",
      "totalFiles": 2
    },
    "timestamp": 1671111111111
  }
  ```

#### 更新文件解析状态

- **方法**: POST
- **路径**: `/server/ndsfile/update-parsed`
- **并发限制**: 32
- **请求体**:
  ```json
  {
    "files": [
      {
        "FileHash": "abc123",
        "Parsed": 1
      }
    ]
  }
  ```
- **并发限制**: 32
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "updatedCount": 1
    },
    "timestamp": 1671111111111
  }
  ```

#### 批量添加文件记录

- **方法**: POST
- **路径**: `/server/ndsfile/batch`
- **并发限制**: 32
- **批处理大小**: 100条/批
- **请求体**:
  ```json
  {
    "files": [
      {
        "NDSID": "123",
        "FilePath": "/path/to/file1",
        "FileTime": "2024-01-01 10:00:00",
        "DataType": "MRO",
        "eNodeBID": "456",
        "SubFileName": "sub1",
        "HeaderOffset": 0,
        "CompressSize": 0,
        "FileSize": 0,
        "FlagBits": 0,
        "CompressType": 0,
        "Parsed": 0
      }
    ]
  }
  ```
- **并发限制**: 32
- **批处理说明**: 每批最多处理 100 条记录
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "total": 2,
      "inserted": 2,
      "failed": 0
    },
    "timestamp": 1671111111111
  }
  ```

#### 补充任务队列

- **方法**: GET
- **路径**: `/server/ndsfile/replenish-tasks`
- **说明**: 异步操作，立即返回成功响应
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "任务补充请求已接受",
    "timestamp": 1671111111111
}
```
### NDS网关 API

#### 检查 NDS 连接

- **方法**: POST
- **路径**: `/gateway/nds/check`
- **请求体**:
  ```json
  {
    "Protocol": "FTP",     // 协议类型 (FTP/SFTP)
    "Address": "1.2.3.4",  // 服务器地址
    "Port": 21,           // 端口号
    "Account": "user",    // 账号
    "Password": "pass"    // 密码
  }
  ```
- **返回示例**:
  ```json
  {
    "code": 200,          // 200: 成功, 400: 参数错误, 500: 连接失败
    "message": "success",
    "data": {
      "status": "connected", // "connected"/"disconnected"
      "protocol": "FTP",
      "host": "1.2.3.4",
      "port": 21
    }
  }
  ```
  失败示例：
  ```json
  {
    "code": 500,
    "message": "Connection check failed",
    "data": {
      "status": "disconnected",
      "reason": "Failed to verify connection"
    }
  }
  ```

#### 更新连接池

- **方法**: POST
- **路径**: `/gateway/nds/update-pool`
- **请求体**:
  ```json
  {
    "action": "add",      // 操作类型: add/update/remove
    "config": {
      "ID": 1,           // 服务器ID
      "Switch": 1,       // 开关状态 (1: 启用, 0: 禁用)
      "Protocol": "FTP", // 协议类型
      "Address": "1.2.3.4",
      "Port": 21,
      "Account": "user",
      "Password": "pass"
    }
  }
  ```
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "message": "Server added successfully"
    }
  }
  ```

#### 扫描文件

- **方法**: POST
- **路径**: `/gateway/nds/scan`
- **请求体**:
  ```json
  {
    "nds_id": "1",           // NDS服务器ID
    "scan_path": "/data",    // 要扫描的路径
    "filter_pattern": "*.zip" // 可选，文件过滤模式
  }
  ```
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": [
      "/data/file1.zip",
      "/data/file2.zip"
    ]
  }
  ```

#### 获取连接池状态

- **方法**: GET
- **路径**: `/gateway/nds/status`
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "1": {
        "protocol": "FTP",
        "host": "1.2.3.4",
        "port": 21,
        "max_connections": 10,
        "available": 8,
        "current_connections": 2,
        "connected": true,
        "last_used": "2025-01-12 06:12:21"
      }
    }
  }
  ```

#### 获取 ZIP 文件信息

- **方法**: POST
- **路径**: `/gateway/nds/zip-info`
- **请求体**:
  ```json
  {
    "nds_id": "1",
    "file_paths": [
      "/data/file1.zip",
      "/data/file2.zip"
    ]
  }
  ```
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "/data/file1.zip": {
        "status": "success",
        "info": [
          {
            "file_name": "example.txt",
            "sub_file_name": "folder/example.txt",
            "directory": false,
            "header_offset": 0,
            "compress_size": 1024,
            "file_size": 2048,
            "flag_bits": 0,
            "compress_type": 8,
            "enodebid": 12345
          }
        ]
      }
    }
  }
  ```

#### 读取文件

- **方法**: POST
- **路径**: `/gateway/nds/read`
- **请求体**:
  ```json
  {
    "NDSID": 1,
    "FilePath": "/data/file1.zip",
    "HeaderOffset": 0,     // 可选，默认0
    "CompressSize": 1024   // 可选，默认读取到文件末尾
  }
  ```
- **返回**: 二进制文件内容
- **响应头**:
  - `Content-Type`: application/octet-stream
  - `Content-Length`: 文件大小
  - `X-File-Size`: 文件大小

#### WebSocket 文件读取

- **路径**: `/gateway/nds/ws/read/{client_id}`
- **说明**: 
  - 使用 WebSocket 协议读取文件
  - 支持断点续传
  - 文件以 512KB 的块大小分段传输
  - 自动处理连接断开和错误情况
- **发送消息格式**:
  ```json
  {
    "NDSID": "1",
    "FilePath": "/data/file1.zip",
    "HeaderOffset": 0,     // 可选，文件头偏移量
    "CompressSize": 1024   // 可选，要读取的字节数
  }
  ```
- **接收消息格式**:
  1. 二进制数据：文件内容（分块发送）
  2. JSON消息：
     ```json
     {
       "end_of_file": true  // 文件传输完成标记
     }
     ```
     或错误消息：
     ```json
     {
       "code": 500,
       "message": "error message",
       "data": null,
       "timestamp": 1671111111111
     }
     ```

### NDS网关 服务控制 API

#### 停止服务

- **方法**: POST
- **路径**: `/gateway/control/stop`
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "status": "stopped"
    }
  }
  ```

#### 启动服务

- **方法**: POST
- **路径**: `/gateway/control/start`
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "status": "running"
    }
  }
  ```

#### 获取服务状态

- **方法**: GET
- **路径**: `/gateway/control/status`
- **返回示例**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "status": "running"
    }
  }
  ```
