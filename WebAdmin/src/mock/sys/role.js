import Mock from "mockjs";

// 模拟角色数据
const roleList = [
  {
    id: "1",
    name: "超级管理员",
    code: "SUPER_ADMIN",
    description: "系统最高权限管理员",
    createTime: "2024-01-15 12:00:00",
    status: 1
  },
  {
    id: "2",
    name: "普通管理员",
    code: "ADMIN",
    description: "系统普通管理员",
    createTime: "2024-01-15 12:00:00",
    status: 1
  },
  {
    id: "3",
    name: "普通用户",
    code: "USER",
    description: "系统普通用户",
    createTime: "2024-01-15 12:00:00",
    status: 1
  }
];

// 获取角色列表
Mock.mock(new RegExp("/api/sys/role/list"), "get", () => {
  return {
    code: 200,
    message: "获取成功",
    data: roleList
  };
});

// 添加角色
Mock.mock(new RegExp("/api/sys/role/add"), "post", (options) => {
  const role = JSON.parse(options.body);
  const newRole = {
    ...role,
    id: Mock.Random.id(),
    createTime: Mock.Random.datetime(),
    status: 1
  };
  roleList.push(newRole);
  return {
    code: 200,
    message: "添加成功",
    data: newRole
  };
});

// 更新角色
Mock.mock(new RegExp("/api/sys/role/update"), "put", (options) => {
  const role = JSON.parse(options.body);
  const index = roleList.findIndex(item => item.id === role.id);
  if (index !== -1) {
    roleList[index] = { ...roleList[index], ...role };
    return {
      code: 200,
      message: "更新成功",
      data: roleList[index]
    };
  }
  return {
    code: 404,
    message: "角色不存在",
    data: null
  };
});

// 删除角色
Mock.mock(new RegExp("/api/sys/role/delete/.*"), "delete", (options) => {
  const id = options.url.split("/").pop();
  const index = roleList.findIndex(item => item.id === id);
  if (index !== -1) {
    roleList.splice(index, 1);
    return {
      code: 200,
      message: "删除成功",
      data: null
    };
  }
  return {
    code: 404,
    message: "角色不存在",
    data: null
  };
});
