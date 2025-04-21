<script setup>
import { onMounted, ref } from "vue";
import {
  getTaskApi,
  updateTaskApi,
  deleteTaskApi,
  startTaskApi,
  stopTaskApi,
} from "@/apis/MParser/task";
import { ElMessage, ElMessageBox, ElLoading } from "element-plus";
import AddTaskDialog from "./components/add-task-dialog/index.vue";
import dayjs from "dayjs";
import {
  Refresh,
  Plus,
  Delete,
  Edit,
  VideoPlay,
  VideoPause,
  View,
} from "@element-plus/icons-vue";
import DetailTaskDialog from './components/detail-task-dialog/index.vue';

const taskList = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const currentEditItem = ref(null);
const detailVisible = ref(false);
const currentDetailItem = ref(null);

// 获取任务列表数据
const fetchTaskList = async () => {
  try {
    loading.value = true;
    const { code, data } = await getTaskApi();
    console.log(data, "====data");

    // 转换后端返回的数据格式
    taskList.value = data?.list?.map((item) => ({
      ID: item.TaskID,
      Name: item.TaskName,
      Type: item.DataType,
      StartTime: dayjs(item.StartTime).format("YYYY-MM-DD HH:mm:ss"),
      EndTime: dayjs(item.EndTime).format("YYYY-MM-DD HH:mm:ss"),
      CreateTime: dayjs(item.createdAt).format("YYYY-MM-DD HH:mm:ss"),
      UpdateTime: dayjs(item.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
      Status: item.Status || "stopped", // 如果后端没有返回Status字段，默认为stopped
    }));
  } catch (error) {
    console.log(error, "====error");
    ElMessage.error("获取任务列表失败");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchTaskList();
});

const handleSwitchChange = async (item) => {
  try {
    await updateTaskApi(item);
    ElMessage.success("更新成功");
    await fetchTaskList();
  } catch (error) {
    ElMessage.error("更新失败");
  }
};

// 手动刷新方法
const handleRefresh = () => {
  fetchTaskList();
  ElMessage.success("数据刷新成功");
};

// 添加单个任务刷新方法
const refreshSingleTask = async (id) => {
  try {
    loading.value = true;
    const { list } = await getTaskApi();
    const updatedTask = list.find((item) => item.ID === id);
    if (updatedTask) {
      const index = taskList.value.findIndex((item) => item.ID === id);
      if (index !== -1) {
        taskList.value[index] = updatedTask;
      }
    }
    ElMessage.success("数据刷新成功");
  } catch (error) {
    ElMessage.error("数据刷新失败");
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  dialogVisible.value = true;
};

const handleDialogSuccess = async () => {
  await fetchTaskList();
  dialogVisible.value = false;
};

const handleDialogClose = () => {
  dialogVisible.value = false;
};

// 删除方法
const handleDelete = async (item) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除任务 "${item.Name}" 吗？`,
      "删除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    await deleteTaskApi(item.ID);
    ElMessage.success("删除成功");
    await fetchTaskList();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "删除失败");
    }
  }
};

// 启动任务
const handleStart = async (item) => {
  const loading = ElLoading.service({
    lock: true,
    text: "正在启动任务...",
    background: "rgba(0, 0, 0, 0.7)",
  });

  try {
    await startTaskApi(item.ID);
    ElMessage.success("任务启动成功");
    await fetchTaskList();
  } catch (error) {
    ElMessage.error(error.message || "启动失败");
  } finally {
    loading.close();
  }
};

// 停止任务
const handleStop = async (item) => {
  const loading = ElLoading.service({
    lock: true,
    text: "正在停止任务...",
    background: "rgba(0, 0, 0, 0.7)",
  });

  try {
    await stopTaskApi(item.ID);
    ElMessage.success("任务停止成功");
    await fetchTaskList();
  } catch (error) {
    ElMessage.error(error.message || "停止失败");
  } finally {
    loading.close();
  }
};

// 添加时间格式化方法
const formatDateTime = (time) => {
  if (!time) return "-";
  return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
};

// 替换原来的handleDetail方法
const handleDetail = (row) => {
  currentDetailItem.value = row;
  detailVisible.value = true;
};

// 定义表格列配置
const columns = [
  {
    prop: 'Name',
    label: '任务名称',
    minWidth: '150',
  },
  {
    prop: 'ID',
    label: '任务ID',
    minWidth: '100',
  },
  {
    prop: 'Type',
    label: '任务类型',
    minWidth: '120',
  },
  {
    prop: 'StartTime',
    label: '开始时间',
    minWidth: '180',
    formatter: (row) => formatDateTime(row.StartTime),
  },
  {
    prop: 'EndTime',
    label: '结束时间',
    minWidth: '180',
    formatter: (row) => formatDateTime(row.EndTime),
  },
  {
    prop: 'CreateTime',
    label: '创建时间',
    minWidth: '180',
    formatter: (row) => formatDateTime(row.CreateTime),
  },
  {
    prop: 'UpdateTime',
    label: '更新时间',
    minWidth: '180',
    formatter: (row) => formatDateTime(row.UpdateTime),
  },
];
</script>

<template>
  <div class="card-container">
    <div class="operation-bar">
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增任务</el-button>
      <el-button :icon="Refresh" @click="handleRefresh">刷新</el-button>
    </div>

    <div class="table-container">
      <el-table
        :data="taskList"
        v-loading="loading"
        border
        fit
        height="100%"
      >
        <el-table-column
          v-for="col in columns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          :min-width="col.minWidth"
          :formatter="col.formatter"
        />
        <el-table-column label="操作" min-width="150" fixed="right">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button
                type="primary"
                :icon="View"
                circle
                size="small"
                @click="handleDetail(row)"
              />
              <el-button
                type="danger"
                :icon="Delete"
                circle
                size="small"
                @click="handleDelete(row)"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <add-task-dialog
      v-model:visible="dialogVisible"
      @success="handleDialogSuccess"
      @close="handleDialogClose"
    />

    <detail-task-dialog
      v-model:visible="detailVisible"
      :task-data="currentDetailItem"
    />
  </div>
</template>

<style scoped>
.card-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.operation-bar {
  padding: 20px 20px 12px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.table-container {
  flex: 1;
  padding: 0 20px 20px;
}

:deep(.el-table) {
  height: 100% !important;
}

:deep(.el-table__inner-wrapper) {
  height: 100%;
}

:deep(.el-table__body-wrapper) {
  overflow-y: hidden;
}

.operation-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}
</style>
