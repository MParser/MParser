import request from "@/utils/request";
import { ElMessage } from "element-plus";

// 统一的错误处理函数
const handleApiError = (error, defaultMessage) => {
  console.error(defaultMessage, error);
  ElMessage.error(error.message || defaultMessage);
  return false;
};

// 获取小区数据列表（支持分页和查询条件）
export const getCellDataListApi = async (params) => {
  try {
    const res = await request({
      url: "/api/cell/list",
      method: "get",
      params
    });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "获取小区数据列表失败");
  } catch (error) {
    return handleApiError(error, "获取小区数据列表失败");
  }
};

// 获取单个小区数据
export const getCellDataApi = async (cgi) => {
  try {
    const res = await request({
      url: `/api/cell/${cgi}`,
      method: "get"
    });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "获取小区数据失败");
  } catch (error) {
    return handleApiError(error, "获取小区数据失败");
  }
};

// 创建小区数据
export const createCellDataApi = async (data) => {
  try {
    const res = await request({
      url: "/api/cell",
      method: "post",
      data
    });
    if (res.code === 200) {
      return res.data;
    }
    return handleApiError(res, "创建小区数据失败");
  } catch (error) {
    return handleApiError(error, "创建小区数据失败");
  }
};

// 更新小区数据
export const updateCellDataApi = async (data) => {
  const { CGI } = data;
  try {
    const res = await request({
      url: `/api/cell/${CGI}`,
      method: "put",
      data
    });
    if (res.code === 200) {
      return res;
    }
    return handleApiError(res, "更新小区数据失败");
  } catch (error) {
    return handleApiError(error, "更新小区数据失败");
  }
};

// 删除单个小区数据
export const deleteCellDataApi = async (cgi) => {
  try {
    const res = await request({
      url: `/api/cell/${cgi}`,
      method: "delete"
    });
    if (res.code === 200) {
      return res;
    }
    return handleApiError(res, "删除小区数据失败");
  } catch (error) {
    return handleApiError(error, "删除小区数据失败");
  }
};

// 批量删除小区数据
export const batchDeleteCellDataApi = async (cgis) => {
  try {
    const res = await request({
      url: "/api/cell/batchDelete",
      method: "post",
      data: { cgis }
    });
    if (res.code === 200) {
      return res;
    }
    return handleApiError(res, "批量删除小区数据失败");
  } catch (error) {
    return handleApiError(error, "批量删除小区数据失败");
  }
};

// 删除所有小区数据
export const deleteAllCellDataApi = async () => {
  try {
    const res = await request({
      url: "/api/cell/batchDelete",
      method: "post",
      data: {}
    });
    if (res.code === 200) {
      return res;
    }
    return handleApiError(res, "删除所有小区数据失败");
  } catch (error) {
    return handleApiError(error, "删除所有小区数据失败");
  }
};

// 上传CSV文件
export const uploadCellDataCsvApi = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await request({
      url: "/api/cell/upload",
      method: "post",
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (res.code === 200) {
      return res;
    }
    return handleApiError(res, "上传小区数据CSV文件失败");
  } catch (error) {
    return handleApiError(error, "上传小区数据CSV文件失败");
  }
};

// 下载所有小区数据
export const downloadCellDataApi = async (params) => {
  try {
    const res = await request({
      url: "/api/cell/download/all",
      method: "get",
      params
    });
    
    if (res.code === 200) {
      return res;
    }
    return handleApiError(res, "下载小区数据失败");
  } catch (error) {
    return handleApiError(error, "下载小区数据失败");
  }
};
