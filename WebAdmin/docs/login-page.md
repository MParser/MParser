# 登录页面文档

## 功能说明

登录页面实现了以下功能：
1. 用户登录
2. 用户注册
3. 主题切换（明暗模式）
4. 表单验证
   - 邮箱格式验证
   - 密码长度验证（至少6位）
   - 确认密码匹配验证

## 技术实现

### 1. 主题切换功能
- 使用 `@vueuse/core` 的 `useDark` 和 `useToggle` 实现主题切换
- 使用 Pinia 进行状态管理
- Element Plus 的暗黑主题支持

相关文件：
```
src/store/sys/theme.js          - 主题状态管理
src/components/framework/theme-option.vue  - 主题切换组件
```

主题切换配置：
```javascript
// main.js
import 'element-plus/theme-chalk/dark/css-vars.css' //夜间模式主题
```

### 2. 表单验证规则

#### 登录表单
- 邮箱：必填，邮箱格式验证
- 密码：必填，最少6位

#### 注册表单
- 邮箱：必填，邮箱格式验证
- 用户名：必填
- 密码：必填，最少6位
- 确认密码：必填，必须与密码一致

### 3. 用户认证接口

#### 登录接口
- 路径：`/api/user/login`
- 方法：POST
- 参数：
  ```javascript
  {
    Email: string,    // 用户邮箱
    Password: string  // 用户密码（至少6位）
  }
  ```
- 返回值：
  ```javascript
  {
    code: 200,       // 状态码
    data: {
      token: string,  // 用户令牌
      email: string   // 用户邮箱
    },
    message: string   // 响应信息
  }
  ```

#### 注册接口
- 路径：`/api/user/register`
- 方法：POST
- 参数：
  ```javascript
  {
    Email: string,    // 用户邮箱
    UserName: string, // 用户名
    Password: string  // 密码（至少6位）
  }
  ```
- 返回值：
  ```javascript
  {
    code: 200,       // 状态码
    data: {
      email: string,    // 用户邮箱
      username: string  // 用户名
    },
    message: string   // 响应信息
  }
  ```

### 4. Mock数据
目前使用Mock.js模拟接口响应，支持以下测试账号：
- 邮箱：admin@example.com
- 密码：123456

## 页面结构

登录页面包含以下主要组件：
1. 登录表单
   - 邮箱输入框（必填，邮箱格式）
   - 密码输入框（必填，至少6位）
   - 登录按钮
   - 注册链接
   - 主题切换开关

2. 注册表单
   - 邮箱输入框（必填，邮箱格式）
   - 用户名输入框（必填）
   - 密码输入框（必填，至少6位）
   - 确认密码输入框（必填，必须匹配）
   - 注册按钮
   - 返回登录链接
   - 主题切换开关

## 样式说明

页面样式使用Element Plus的变量系统，支持明暗主题切换：
- 标题使用渐变色效果
- 表单使用Element Plus的组件
- 布局采用flex布局
- 响应式设计适配不同屏幕尺寸

## 后续开发建议

1. 完善表单验证
   - 添加密码强度提示
   - 添加用户名格式验证
   - 添加实时验证反馈

2. 完善错误处理
   - 添加网络错误提示
   - 添加表单错误提示
   - 添加加载状态显示

3. 安全性增强
   - 添加密码加密
   - 添加验证码功能
   - 添加登录尝试次数限制

4. 用户体验优化
   - 添加记住密码功能
   - 添加自动登录功能
   - 添加忘记密码功能
