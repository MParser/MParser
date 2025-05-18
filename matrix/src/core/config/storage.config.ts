/**
 * 存储相关配置
 */
export default {
  // LocalStorage键前缀
  storagePrefix: 'mparser_',
  // 数据加密相关
  crypto: {
    // AES加密密钥 (16位)
    aesKey: 'MParser20250515XY',
    // AES加密IV (16位)
    aesIv: 'MParserWeb202505',
    // 加密盐值
    salt: 'MPARSER@WEB#2025',
    // 是否启用加密存储
    enableEncryption: true,
    // 哈希迭代次数
    hashIterations: 1000,
  },
  
  // Token相关
  token: {
    // token存储键名
    tokenKey: 'token',
    // token过期时间（小时）
    expireTime: 24,
    // 是否自动刷新token
    autoRefresh: true,
  },
  
  // 用户信息相关
  user: {
    // 用户信息存储键名
    userInfoKey: 'user_info',
    // 权限数据存储键名
    permissionsKey: 'permissions',
  },
  
  // 系统缓存设置
  cache: {
    // 是否启用缓存
    enable: true,
    // 缓存过期时间（分钟）
    expireTime: 60,
  },
}
