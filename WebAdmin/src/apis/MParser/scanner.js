import request from "@/utils/request";
import { ElMessage } from "element-plus";

// 统一的错误处理函数
const handleApiError = (error, defaultMessage) => {
  console.error(defaultMessage, error);
  ElMessage.error(error.message || defaultMessage);
  return false;
};

// 获取扫描器列表
export async function getScannerApi() {
  try {
    const res = await request({
      url: "/api/scanner",
      method: "get",
    });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "获取扫描器列表失败");
  } catch (error) {
    return handleApiError(error, "获取扫描器列表失败");
  }
}

// 添加扫描器
export async function addScannerApi(data) {
  try {
    const res = await request({
      url: "/api/scanner",
      method: "post",
      data,
    });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "添加扫描器失败");
  } catch (error) {
    return handleApiError(error, "添加扫描器失败");
  }
}

// 更新扫描器
export async function updateScannerApi(data) {
  try {
    const res = await request({
      url: `/api/scanner/${data.ID}`,
      method: "put",
      data,
    });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "更新扫描器失败");
  } catch (error) {
    return handleApiError(error, "更新扫描器失败");
  }
}

// 删除扫描器
export async function deleteScannerApi(id) {
  try {
    const res = await request({
      url: `/api/scanner/${id}`,
      method: "delete",
    });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "删除扫描器失败");
  } catch (error) {
    return handleApiError(error, "删除扫描器失败");
  }
}
// 剔除扫描器
export async function removeScannerApi(data) {
  try {
    const res = await request({
      url: `/api/scanner/nds`,
      method: "delete",
      data,
    });
    const { code, message } = res;
    if (code === 200) {
      ElMessage.success(message);
      return res.data;
    }
    return handleApiError(res, message);
  } catch (error) {
    return handleApiError(error, "删除扫描器失败");
  }
}
// 获取单个扫描器详情
export async function getScannerDetailApi(id) {
  try {
    const res = await request({
      url: `/api/scanner/${id}`,
      method: "get",
    });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "获取扫描器详情失败");
  } catch (error) {
    return handleApiError(error, "获取扫描器详情失败");
  }
}

// 绑定网关
export async function bindGatewayApi(scannerId, gatewayId) {
  try {
    const res = await request({
      url: `/api/scanner/gateway`,
      method: "post",
      data: {
        scannerId,
        gatewayId,
      },
    });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "绑定网关失败");
  } catch (error) {
    return handleApiError(error, "绑定网关失败");
  }
}
// 绑定NDS
export async function bindNdsApi(scannerId, ndsIds = []) {
  try {
    const res = await request({
      url: `/api/scanner/nds`,
      method: "post",
      data: {
        scannerId,
        ndsIds,
      },
    });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "绑定NDS失败");
  } catch (error) {
    return handleApiError(error, "绑定NDS失败");
  }
}

// 解绑网关
export async function unbindGatewayApi(scannerId) {
  try {
    const res = await request({
      url: `/api/scanner/${scannerId}/gateway`,
      method: "delete",
    });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "解绑网关失败");
  } catch (error) {
    return handleApiError(error, "解绑网关失败");
  }
}

// 启用/禁用扫描器
export async function toggleScannerStatusApi(id, status) {
  try {
    const res = await request({
      url: `/api/scanner/${id}/status`,
      method: "put",
      data: { status },
    });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "修改扫描器状态失败");
  } catch (error) {
    return handleApiError(error, "修改扫描器状态失败");
  }
}
