import Mock from "mockjs";

// 模拟部门数据
const departmentList = [
  {
    id: "1",
    name: "总裁办",
    parentId: "0",
    description: "公司最高决策部门",
    children: [
      {
        id: "1-1",
        name: "行政部",
        parentId: "1",
        description: "负责公司日常行政管理"
      },
      {
        id: "1-2",
        name: "人力资源部",
        parentId: "1",
        description: "负责公司人力资源管理"
      }
    ]
  },
  {
    id: "2",
    name: "技术部",
    parentId: "0",
    description: "负责公司技术研发",
    children: [
      {
        id: "2-1",
        name: "前端组",
        parentId: "2",
        description: "负责前端开发"
      },
      {
        id: "2-2",
        name: "后端组",
        parentId: "2",
        description: "负责后端开发"
      }
    ]
  }
];

// Mock 配置
Mock.mock(new RegExp("/api/sys/department/list"), "get", () => {
  return {
    code: 200,
    message: "获取成功",
    data: departmentList
  };
});

Mock.mock(new RegExp("/api/sys/department/add"), "post", (options) => {
  const { name, parentId, description } = JSON.parse(options.body);
  const newDepartment = {
    id: Mock.Random.id(),
    name,
    parentId,
    description,
    children: []
  };

  const addToParent = (list, parentId) => {
    for (const item of list) {
      if (item.id === parentId) {
        item.children = item.children || [];
        item.children.push(newDepartment);
        return true;
      }
      if (item.children && item.children.length) {
        if (addToParent(item.children, parentId)) {
          return true;
        }
      }
    }
    return false;
  };

  if (parentId === "0") {
    departmentList.push(newDepartment);
  } else {
    addToParent(departmentList, parentId);
  }

  return {
    code: 200,
    message: "添加成功",
    data: newDepartment
  };
});

Mock.mock(new RegExp("/api/sys/department/update"), "put", (options) => {
  const { id, name, parentId, description } = JSON.parse(options.body);

  const updateDepartment = (list) => {
    for (const item of list) {
      if (item.id === id) {
        Object.assign(item, { name, parentId, description });
        return true;
      }
      if (item.children && item.children.length) {
        if (updateDepartment(item.children)) {
          return true;
        }
      }
    }
    return false;
  };

  if (!updateDepartment(departmentList)) {
    return {
      code: 404,
      message: "部门不存在",
      data: null
    };
  }

  return {
    code: 200,
    message: "更新成功",
    data: null
  };
});

Mock.mock(new RegExp("/api/sys/department/delete/.*"), "delete", (options) => {
  const id = options.url.split("/").pop();

  const deleteDepartment = (list) => {
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        list.splice(i, 1);
        return true;
      }
      if (list[i].children && list[i].children.length) {
        if (deleteDepartment(list[i].children)) {
          return true;
        }
      }
    }
    return false;
  };

  if (!deleteDepartment(departmentList)) {
    return {
      code: 404,
      message: "部门不存在",
      data: null
    };
  }

  return {
    code: 200,
    message: "删除成功",
    data: null
  };
});
