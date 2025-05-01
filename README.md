# MParser - 分布式MRO/MDT数据解析系统
## 系统简介
MParser - 基于分布式架构的数据解析系统，核心特性：

1. **边缘智能解析**  
   👨💻 支持异构计算节点接入  。
   - 兼容Intel/AMD多代处理器（含淘汰设备） 。 
   - 基于Docker容器化部署, 支持多平台部署。

   ⚡ 并行计算架构  
   - 支持个人电脑/服务器集群
   ✨ 解析节点支持边缘计算能力，可扩展分布式数据处理，减少中心节点负载, 节约服务器成本。
   🚀 特有流式数据分片处理技术，加快单节点处理速度。

2. **高效数据管道**  
   🔍 创新的"内存-缓存"双级流水线架构，避免传统磁盘IO瓶颈。

3. **智能存储优化**  
   ⚡ 过期数据自动清理，节省存储成本。

## 节点介绍
### Center - 中心节点
**技术栈**  
![Node.js](https://img.shields.io/badge/Node.js-22.13.0-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.3.1-blueviolet)

**核心功能**  
1. **节点管理**  
   - 数据管理、任务配置等节点生命周期
   - 实现节点注册与管理

2. **任务调度**  
   - 基于Redis的分布式任务队列
   - 文件过滤与任务分发

3. **数据服务**  
   - MySQL数据存储
   - 提供RESTful API（集成Swagger文档）

**架构特性**  
- 容器化部署支持
- 多环境配置管理（config.json + .env）
- 高并发处理（async-mutex实现资源锁）


### Gateway - 网关节点

### Scanner - 扫描节点

### Parser - 解析节点
