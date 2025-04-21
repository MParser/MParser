import Mock from "mockjs";

// 模拟用户数据
const userList = [
  {
    id: "1",
    username: "admin",
    email: "admin@example.com",
    status: 1,
    departmentId: "1",
    departmentName: "总裁办",
    roleIds: ["1"],
    roleNames: ["超级管理员"],
    createTime: "2024-01-15 12:00:00",
    lastLoginTime: "2024-01-17 08:30:00"
  },
  {
    id: "2",
    username: "zhangsan",
    email: "zhangsan@example.com",
    status: 1,
    departmentId: "2",
    departmentName: "技术部",
    roleIds: ["2"],
    roleNames: ["普通管理员"],
    createTime: "2024-01-15 14:00:00",
    lastLoginTime: "2024-01-17 09:00:00"
  },
  {
    id: "3",
    username: "lisi",
    email: "lisi@example.com",
    status: 0,
    departmentId: "2-1",
    departmentName: "前端组",
    roleIds: ["3"],
    roleNames: ["普通用户"],
    createTime: "2024-01-15 15:00:00",
    lastLoginTime: "2024-01-17 10:00:00"
  }
];

// 获取用户列表
Mock.mock(new RegExp("/api/sys/usermanage/list"), "get", () => {
  return {
    code: 200,
    message: "获取成功",
    data: userList
  };
});

// 添加用户
Mock.mock(new RegExp("/api/sys/usermanage/add"), "post", (options) => {
  const user = JSON.parse(options.body);
  const newUser = {
    ...user,
    id: Mock.Random.id(),
    createTime: Mock.Random.datetime(),
    lastLoginTime: "",
    status: 1
  };
  userList.push(newUser);
  return {
    code: 200,
    message: "添加成功",
    data: newUser
  };
});

// 更新用户
Mock.mock(new RegExp("/api/sys/usermanage/update"), "put", (options) => {
  const user = JSON.parse(options.body);
  const index = userList.findIndex(item => item.id === user.id);
  if (index !== -1) {
    userList[index] = { ...userList[index], ...user };
    return {
      code: 200,
      message: "更新成功",
      data: userList[index]
    };
  }
  return {
    code: 404,
    message: "用户不存在",
    data: null
  };
});

// 删除用户
Mock.mock(new RegExp("/api/sys/usermanage/delete"), "post", (options) => {
  const { ids } = JSON.parse(options.body);
  const deleteCount = ids.reduce((count, id) => {
    const index = userList.findIndex(item => item.id === id);
    if (index !== -1) {
      userList.splice(index, 1);
      return count + 1;
    }
    return count;
  }, 0);
  
  return {
    code: 200,
    message: `成功删除 ${deleteCount} 个用户`,
    data: null
  };
});

// 修改密码
Mock.mock(new RegExp("/api/sys/usermanage/password"), "put", (options) => {
  const { id, password } = JSON.parse(options.body);
  const user = userList.find(item => item.id === id);
  if (user) {
    return {
      code: 200,
      message: "密码修改成功",
      data: null
    };
  }
  return {
    code: 404,
    message: "用户不存在",
    data: null
  };
});

// 批量更新部门
Mock.mock(new RegExp("/api/sys/usermanage/batch/department"), "put", (options) => {
  const { ids, departmentId, departmentName } = JSON.parse(options.body);
  const updateCount = ids.reduce((count, id) => {
    const user = userList.find(item => item.id === id);
    if (user) {
      user.departmentId = departmentId;
      user.departmentName = departmentName;
      return count + 1;
    }
    return count;
  }, 0);

  return {
    code: 200,
    message: `成功更新 ${updateCount} 个用户的部门`,
    data: null
  };
});

// 批量更新角色
Mock.mock(new RegExp("/api/sys/usermanage/batch/role"), "put", (options) => {
  const { ids, roleIds, roleNames } = JSON.parse(options.body);
  const updateCount = ids.reduce((count, id) => {
    const user = userList.find(item => item.id === id);
    if (user) {
      user.roleIds = roleIds;
      user.roleNames = roleNames;
      return count + 1;
    }
    return count;
  }, 0);

  return {
    code: 200,
    message: `成功更新 ${updateCount} 个用户的角色`,
    data: null
  };
});
