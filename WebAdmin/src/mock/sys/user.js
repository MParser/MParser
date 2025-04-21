import Mock from "mockjs";

// 用户相关接口
const userApi = {
  register: "/api/user/register",
  login: "/api/user/login",
  logout: "/api/user/logout",
  verify: "/api/user/verify"
};

// 模拟用户数据
const mockUserInfo = {
  id: 1,
  email: "admin@qq.com",
  username: "Admin",
  departmentId: 1,
  department: "技术部",
  roleIds: [1],
  roles: ["管理员"],
  avatar: "",
  createTime: "2024-01-15 12:00:00",
  lastLoginTime: "2024-01-15 23:59:59"
};

// 注册接口
Mock.mock(userApi.register, "post", (options) => {
  const { Email, UserName, Password } = JSON.parse(options.body);
  return {
    code: 200,
    message: "注册成功"
  };
});

// 登录接口
Mock.mock(userApi.login, "post", (options) => {
  const { Email, Password } = JSON.parse(options.body);

  if (Email === "admin@qq.com" && Password === "123456") {
    // 更新最后登录时间
    mockUserInfo.lastLoginTime = new Date().toLocaleString();

    return {
      code: 200,
      message: "登录成功",
      data: mockUserInfo
    };
  }

  return {
    code: 401,
    message: "邮箱或密码错误"
  };
});

// 验证登录状态接口
Mock.mock(new RegExp(userApi.verify), "get", () => {
  return {
    code: 200,
    message: "验证成功",
    data: mockUserInfo
  };
});

// 用户登出
Mock.mock(new RegExp(userApi.logout), "post", () => {
  return {
    code: 200,
    message: "注销成功",
    data: {}
  };
});

// 系统公告
Mock.mock("/api/sys/announcements", "get", () => {
  return {
    code: 200,
    message: "获取系统公告成功",
    data: [
      {
        id: 1,
        title: "系统更新通知",
        content:
          "系统将于本周五进行例行维护和功能更新，请提前做好相关工作安排。",
        date: "2025-01-15",
        type: "warning" // primary / success / warning / danger / info
      },
      {
        id: 2,
        title: "新功能上线公告",
        content: "系统新增数据导出功能，支持多种格式导出，欢迎试用并提供反馈。",
        date: "2025-01-10",
        type: "success"
      },
      {
        id: 3,
        title: "操作指南更新",
        content: "系统操作手册已更新，请在帮助中心查看最新版本。",
        date: "2025-01-05",
        type: "info"
      }
    ]
  };
});

// 修改个人信息
Mock.mock("/api/sys/user/info", "put", (options) => {
  const { username, email, bio } = JSON.parse(options.body);
  return {
    code: 200,
    message: "个人信息修改成功",
    data: {
      username,
      email,
      bio
    }
  };
});

// 修改密码
Mock.mock("/api/sys/user/password", "put", (options) => {
  const { oldPassword, newPassword } = JSON.parse(options.body);
  // 简单的密码验证逻辑
  if (oldPassword === "123456") {
    return {
      code: 200,
      message: "密码修改成功"
    };
  }
  return {
    code: 400,
    message: "原密码错误"
  };
});

// 上传头像
Mock.mock("/api/sys/user/avatar", "post", (options) => {
  const { avatar } = JSON.parse(options.body);
  // 模拟返回一个头像URL
  mockUserInfo.avatar =
    "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg";
  return {
    code: 200,
    message: "头像上传成功",
    data: {
      url: mockUserInfo.avatar
    }
  };
});
