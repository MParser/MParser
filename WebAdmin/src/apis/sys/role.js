import request from "@/utils/request";
import { ElMessage } from "element-plus";

// 统一的错误处理函数
const handleApiError = (error, defaultMessage) => {
  console.error(defaultMessage, error);
  ElMessage.error(error.message || defaultMessage);
  return false;
};

// 获取角色列表
export async function getRoleList() {
  try {
    const res = await request({
      url: "/api/sys/role/list",
      method: "get"
    });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "获取角色列表失败");
  } catch (error) {
    return handleApiError(error, "获取角色列表失败");
  }
}

// 添加角色
export async function addRole(data) {
  try {
    const res = await request({
      url: "/api/sys/role/add",
      method: "post",
      data
    });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "添加角色失败");
  } catch (error) {
    return handleApiError(error, "添加角色失败");
  }
}

// 更新角色
export async function updateRole(data) {
  try {
    const res = await request({
      url: "/api/sys/role/update",
      method: "put",
      data
    });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "更新角色失败");
  } catch (error) {
    return handleApiError(error, "更新角色失败");
  }
}

// 删除角色
export async function deleteRole(id) {
  try {
    const res = await request({
      url: `/api/sys/role/delete/${id}`,
      method: "delete"
    });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "删除角色失败");
  } catch (error) {
    return handleApiError(error, "删除角色失败");
  }
}
