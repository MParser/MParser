import appConfig from './app.config'
import apiConfig from './api.config'
import storageConfig from './storage.config'

/**
 * 导出所有配置
 */
export default {
  app: appConfig,
  api: apiConfig,
  storage: storageConfig
}

// 单独导出各个配置，便于按需引入
export { appConfig, apiConfig, storageConfig }
