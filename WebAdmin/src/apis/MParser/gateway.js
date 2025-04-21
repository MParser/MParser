import request from "@/utils/request";
import { ElMessage } from "element-plus";

// 统一的错误处理函数
const handleApiError = (error, defaultMessage) => {
  console.error(defaultMessage, error);
  ElMessage.error(error.message || defaultMessage);
  return false;
};
// 获取网关列表
export async function getGatewayListApi() {
  try {
    const res = await request({
      url: "/api/gateway",
      method: "get",
    });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "获取网关列表失败");
  } catch (error) {
    return handleApiError(error, "获取网关列表失败");
  }
}

export const updateGatewayApi = async (data) => {
  const { ID } = data;
  try {
    const res = await request({
      url: `/api/gateway/${ID}`,
      method: "put",
      data,
    });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "更新网关失败");
  } catch (error) {
    return handleApiError(error, "更新网关失败");
  }
};

export const updateGatewayNdsApi = async (data) => {
  const { gatewayId, ndsId } = data;
  try {
    const res = await request({
      url: `/api/gateway/${gatewayId}/nds`,
      method: "put",
      data: {
        ndsIds: ndsId,
      },
    });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "更新网关NDS失败");
  } catch (error) {
    return handleApiError(error, "更新网关NDS失败");
  }
};

export const getGatewayNdsApi = async (gatewayId) => {
  try {
    const res = await request({
      url: `/api/gateway/${gatewayId}/nds`,
      method: "get",
    });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "获取网关NDS列表失败");
  } catch (error) {
    return handleApiError(error, "获取网关NDS列表失败");
  }
};

export async function deleteGatewayApi(id) {
  try {
    const res = await request({
      url: `/api/gateway/${id}`,
      method: 'delete'
    });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "删除网关失败");
  } catch (error) {
    return handleApiError(error, "删除网关失败");
  }
}
