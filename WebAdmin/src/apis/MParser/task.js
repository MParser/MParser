import request from "@/utils/request";
import { ElMessage } from "element-plus";

const baseURL = "/api/task";

// 统一的错误处理函数
const handleApiError = (error, defaultMessage) => {
  console.error(defaultMessage, error);
  ElMessage.error(error.message || defaultMessage);
  return Promise.reject(error);
};

// 获取任务列表
export async function getTaskApi() {
  try {
    return await request({
      url: `${baseURL}/list`,
      method: "get",
    });
  } catch (error) {
    return handleApiError(error, "获取任务列表失败");
  }
}

// 添加任务
export async function addTaskApi(data) {
  try {
    return await request({
      url: "/api/task/add",
      method: "post",
      data: {
        TaskName: data.TaskName,
        DataType: data.Type,
        StartTime: data.StartTime,
        EndTime: data.EndTime,
        Status: data.Status || "stopped",
        eNodeBIDs: data.eNodeBIDs || [],
      },
    });
  } catch (error) {
    return handleApiError(error, "添加任务失败");
  }
}

// 添加ENB ID
export async function updateENBidsApi(taskId, data) {
  try {
    return await request({
      url: `/api/task/${taskId}/enbs`,
      method: "put",
      data,
    });
  } catch (error) {
    return handleApiError(error, "添加ENB ID失败");
  }
}

// 更新任务
export async function updateTaskApi(data) {
  try {
    return await request({
      url: `${baseURL}/${data.ID}`,
      method: "put",
      data: {
        TaskID: data.ID,
        TaskName: data.Name,
        DataType: data.Type,
        StartTime: data.StartTime,
        EndTime: data.EndTime,
        Status: data.Status,
      },
    });
  } catch (error) {
    return handleApiError(error, "更新任务失败");
  }
}

// 删除任务
export async function deleteTaskApi(id) {
  try {
    return await request({
      url: `${baseURL}/${id}`,
      method: "delete",
    });
  } catch (error) {
    return handleApiError(error, "删除任务失败");
  }
}

// 启动任务
export async function startTaskApi(id) {
  try {
    return await request({
      url: `${baseURL}/${id}/start`,
      method: "post",
    });
  } catch (error) {
    return handleApiError(error, "启动任务失败");
  }
}

// 停止任务
export async function stopTaskApi(id) {
  try {
    return await request({
      url: `${baseURL}/${id}/stop`,
      method: "post",
    });
  } catch (error) {
    return handleApiError(error, "停止任务失败");
  }
}

// 获取单个任务详情
export async function getTaskDetailApi(id) {
  try {
    return await request({
      url: `/api/task/detail/${id}`,
      method: "get",
    });
  } catch (error) {
    return handleApiError(error, "获取任务详情失败");
  }
}

// 获取任务执行历史
export async function getTaskHistoryApi(id, params) {
  try {
    return await request({
      url: `${baseURL}/${id}/history`,
      method: "get",
      params,
    });
  } catch (error) {
    return handleApiError(error, "获取任务历史失败");
  }
}

// 获取任务执行日志
export async function getTaskLogsApi(id, params) {
  try {
    return await request({
      url: `${baseURL}/${id}/logs`,
      method: "get",
      params,
    });
  } catch (error) {
    return handleApiError(error, "获取任务日志失败");
  }
}
