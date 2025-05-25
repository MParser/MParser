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
import TaskDataDrawer from './components/task-data-drawer/index.vue';

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
    const {data} = await getTaskApi();

    // 转换后端返回的数据格式
    taskList.value = data?.map((item) => ({
      id: item.id,
      name: item.name,
      data_type: item.data_type,
      start_time: formatDateTime(item.start_time),
      end_time: formatDateTime(item.end_time),
      createdAt: formatDateTime(item.createdAt),
      updatedAt: formatDateTime(item.updatedAt),
      status: item.status || "stopped", // 如果后端没有返回Status字段，默认为stopped
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
      `确定要删除任务 "${item.name}" 吗？`,
      "删除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    await deleteTaskApi(item.id);
    ElMessage.success("删除成功");
    await fetchTaskList();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "删除失败");
    }
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
    prop: 'name',
    label: '任务名称',
    minWidth: '150',
  },
  {
    prop: 'id',
    label: '任务ID',
    minWidth: '100',
  },
  {
    prop: 'data_type',
    label: '任务类型',
    minWidth: '120',
  },
  {
    prop: 'start_time',
    label: '开始时间',
    minWidth: '180',
    formatter: (row) => formatDateTime(row.start_time),
  },
  {
    prop: 'end_time',
    label: '结束时间',
    minWidth: '180',
    formatter: (row) => formatDateTime(row.end_time),
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    minWidth: '180',
    formatter: (row) => formatDateTime(row.createdAt),
  },
  {
    prop: 'updatedAt',
    label: '更新时间',
    minWidth: '180',
    formatter: (row) => formatDateTime(row.updatedAt),
  },
];

const taskDataId = ref(null);
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
                :icon="View"
                circle
                size="small"
                @click="() => taskDataId = row.id"
              />
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

    <TaskDataDrawer
      :taskId="taskDataId"
      @close="() => taskDataId = null"
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
