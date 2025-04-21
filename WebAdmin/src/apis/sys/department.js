import request from "@/utils/request";
import { ElMessage } from "element-plus";

// 统一的错误处理函数
const handleApiError = (error, defaultMessage) => {
  console.error(defaultMessage, error);
  ElMessage.error(error.message || defaultMessage);
  return false;
};

/**
 * 获取部门列表
 * @returns {Promise<Array>} 部门列表数据
 */
export const getDepartmentList = async () => {
  try {
    const res = await request({
      url: "/api/sys/department/list",
      method: "get"
    });

    if (res.code === 200) {
      return res.data;
    }
    throw new Error(res.message || "获取部门列表失败");
  } catch (error) {
    return handleApiError(error, "获取部门列表失败");
  }
};

/**
 * 添加部门
 * @param {Object} data - 部门数据
 * @param {string} data.name - 部门名称
 * @param {string} data.parentId - 父部门ID
 * @param {string} data.description - 部门描述
 * @returns {Promise<boolean>} 是否添加成功
 */
export const addDepartment = async (data) => {
  try {
    const res = await request({
      url: "/api/sys/department/add",
      method: "post",
      data
    });

    if (res.code === 200) {
      ElMessage.success("添加部门成功");
      return true;
    }
    throw new Error(res.message || "添加部门失败");
  } catch (error) {
    return handleApiError(error, "添加部门失败");
  }
};

/**
 * 更新部门信息
 * @param {Object} data - 部门数据
 * @param {string} data.id - 部门ID
 * @param {string} data.name - 部门名称
 * @param {string} data.parentId - 父部门ID
 * @param {string} data.description - 部门描述
 * @returns {Promise<boolean>} 是否更新成功
 */
export const updateDepartment = async (data) => {
  try {
    const res = await request({
      url: "/api/sys/department/update",
      method: "put",
      data
    });

    if (res.code === 200) {
      ElMessage.success("更新部门成功");
      return true;
    }
    throw new Error(res.message || "更新部门失败");
  } catch (error) {
    return handleApiError(error, "更新部门失败");
  }
};

/**
 * 删除部门
 * @param {string} id - 部门ID
 * @returns {Promise<boolean>} 是否删除成功
 */
export const deleteDepartment = async (id) => {
  try {
    const res = await request({
      url: `/api/sys/department/delete/${id}`,
      method: "delete"
    });

    if (res.code === 200) {
      ElMessage.success("删除部门成功");
      return true;
    }
    throw new Error(res.message || "删除部门失败");
  } catch (error) {
    return handleApiError(error, "删除部门失败");
  }
};
