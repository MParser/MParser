# API接口文档

## 用户相关接口

### 登录

- 请求路径：`/api/user/login`
- 请求方法：POST
- 请求参数：

| 参数名   | 类型   | 是否必须 | 说明   |
| -------- | ------ | -------- | ------ |
| username | string | 是       | 用户名 |
| password | string | 是       | 密码   |

- 响应参数：

| 参数名  | 类型   | 说明     |
| ------- | ------ | -------- |
| code    | number | 状态码   |
| data    | object | 返回数据 |
| message | string | 提示信息 |

- 响应示例：

```json
{
  "code": 200,
  "data": {
    "token": "xxx",
    "username": "admin"
  },
  "message": "登录成功"
}
```

### 获取用户信息

- 请求路径：`/api/user/info`
- 请求方法：GET
- 请求头：需要携带token
- 响应参数：

| 参数名  | 类型   | 说明     |
| ------- | ------ | -------- |
| code    | number | 状态码   |
| data    | object | 返回数据 |
| message | string | 提示信息 |

- 响应示例：

```json
{
  "code": 200,
  "data": {
    "username": "admin",
    "avatar": "https://example.com/avatar.jpg",
    "roles": ["admin"]
  },
  "message": "success"
}
```
