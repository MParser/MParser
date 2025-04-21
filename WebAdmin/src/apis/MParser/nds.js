import request from "@/utils/request";
import { ElMessage } from "element-plus";

// 统一的错误处理函数
const handleApiError = (error, defaultMessage) => {
  console.error(defaultMessage, error);
  ElMessage.error(error.message || defaultMessage);
  return false;
};
// 获取网关列表
export const getNdsApi = async () => {
  try {
    const res = await request({ url: "/api/nds/list", method: "get" });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "获取Nds列表失败");
  } catch (error) {
    return handleApiError(error, "获取Nds列表失败");
  }
};

export function createNdsApi(data) {
  return request({
    url: "/api/nds/add",
    method: "post",
    data,
  });
}

// 更新NDS
export const updateNdsApi = async (data) => {
  const { ID } = data;
  try {
    const res = await request({
      url: `/api/nds/${ID}`,
      method: "put",
      data,
    });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "更新NDS失败");
  } catch (error) {
    return handleApiError(error, "更新NDS失败");
  }
};

// 删除NDS
export const deleteNdsApi = async (id) => {
  try {
    const res = await request({
      url: `/api/nds/delete/${id}`,
      method: "delete",
    });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "删除NDS失败");
  } catch (error) {
    return handleApiError(error, "删除NDS失败");
  }
};

export const batchAddNdsApi = (data) => {
  return request({
    url: "/nds/batch",
    method: "post",
    data,
  });
};

export const connectNdsApi = (id) => {
  return request({
    url: `/api/nds/${id}/test`,
    method: "post",
  });
};
