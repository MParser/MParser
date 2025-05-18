/**
 * API相关配置
 */
export default {
  // 基础请求路径
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',

  // 接口超时时间（毫秒）
  timeout: 60000,

  // 接口版本
  version: 'v1',

  // 请求头设置
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },

  // 响应数据格式
  responseType: 'json',

  // 状态码对应的消息
  statusMessage: {
    200: '请求成功',
    201: '创建或修改数据成功',
    204: '删除数据成功',
    400: '请求参数错误',
    401: '未授权，请重新登录',
    403: '拒绝访问',
    404: '请求的资源不存在',
    409: '数据冲突',
    500: '服务器内部错误',
  },

}
