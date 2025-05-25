import request from "@/utils/request";
import { ElMessage } from "element-plus";

// 统一的错误处理函数
const handleApiError = (error, defaultMessage) => {
  console.error(defaultMessage, error);
  ElMessage.error(error.message || defaultMessage);
  return false;
};
// 获取解析器列表
export const getParserApi = async () => {
  try {
    const res = await request({ url: "/api/parser/list", method: "get" });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "获取解析器列表失败");
  } catch (error) {
    return handleApiError(error, "获取解析器列表失败");
  }
};

/**
 * 更新解析器数据
 * @param {Object} data - 解析器数据
 * @returns {Promise<Object>} 更新后的解析器数据
 */
export const updateParserApi = async (data) => {
  // 后端路由期望的ID字段名是id，而不是ID
  const { id } = data;
  
  // 创建请求数据对象，保持与后端字段名一致
  const requestData = { ...data };
  // 删除不需要的字段，确保字段名和后端匹配
  if (id) requestData.id = id; // 添加小写id
  
  try {
    const res = await request({
      url: `/api/parser/${id}`,
      method: "put",
      data: requestData, // 使用转换后的数据
    });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "更新解析器失败");
  } catch (error) {
    return handleApiError(error, "更新解析器失败");
  }
};


export function deleteParserApi(id) {
  return request({
    url: `/api/parser/${id}`,
    method: "delete",
  });
}
export const bindGatewayApi = async (data) => {
  const { GatewayID: gatewayId, ID: parserId } = data;
  return request({
    url: `/api/parser/${parserId}/gateway`,
    method: "post",
    data: {
      gatewayId
    },
  });
};
