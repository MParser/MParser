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
    const res = await request({ url: "/api/parser", method: "get" });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "获取解析器列表失败");
  } catch (error) {
    return handleApiError(error, "获取解析器列表失败");
  }
};

export const updateParserApi = async (data) => {
  const { ID } = data;
  try {
    const res = await request({
      url: `/api/parser/${ID}`,
      method: "put",
      data,
    });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "更新解析器失败");
  } catch (error) {
    return handleApiError(error, "更新解析器失败");
  }
};

export const updateParserNdsApi = async (data) => {
  const { parserId, ndsId } = data;
  return request({
    url: `/api/parser/${parserId}/nds`,
    method: "put",
    data: {
      ndsIds: ndsId,
    },
  });
};

export const getParserNdsApi = async (parserId) => {
  return request({
    url: `/api/parser/${parserId}/nds`,
    method: "get",
  });
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
    url: `/api/parser/gateway`,
    method: "post",
    data: {
      gatewayId,
      parserId,
    },
  });
};
