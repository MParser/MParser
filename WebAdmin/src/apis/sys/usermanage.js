import request from "@/utils/request";

// 获取用户列表
export function getUserList() {
  return request({
    url: "/api/sys/usermanage/list",
    method: "get"
  });
}

// 添加用户
export function addUser(data) {
  return request({
    url: "/api/sys/usermanage/add",
    method: "post",
    data
  });
}

// 更新用户
export function updateUser(data) {
  return request({
    url: "/api/sys/usermanage/update",
    method: "put",
    data
  });
}

// 删除用户
export function deleteUsers(ids) {
  return request({
    url: "/api/sys/usermanage/delete",
    method: "post",
    data: { ids }
  });
}

// 修改密码
export function updatePassword(id, password) {
  return request({
    url: "/api/sys/usermanage/password",
    method: "put",
    data: { id, password }
  });
}

// 批量更新部门
export function batchUpdateDepartment(ids, departmentId, departmentName) {
  return request({
    url: "/api/sys/usermanage/batch/department",
    method: "put",
    data: { ids, departmentId, departmentName }
  });
}

// 批量更新角色
export function batchUpdateRole(ids, roleIds, roleNames) {
  return request({
    url: "/api/sys/usermanage/batch/role",
    method: "put",
    data: { ids, roleIds, roleNames }
  });
}
