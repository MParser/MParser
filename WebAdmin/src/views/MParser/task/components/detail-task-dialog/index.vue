<script setup>
import { computed, ref, watch } from "vue";
import dayjs from "dayjs";
import { useVModel } from "@vueuse/core";
import { getTaskDetailApi, updateENBidsApi } from "@/apis/MParser/task";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search } from "@element-plus/icons-vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  taskData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:visible"]);

// 使用useVModel处理visible
const dialogVisible = useVModel(props, "visible", emit);

// 详情数据
const detailData = ref({});
const loading = ref(false);

// 监听弹窗显示，获取详情
watch(dialogVisible, async (val) => {
  if (val && props.taskData?.ID) {
    await fetchTaskDetail();
  } else {
    detailData.value = {};
  }
});

const handleClose = () => {
  dialogVisible.value = false;
  detailData.value = {};
  batchInput.value = "";
  selectedEnbs.value = [];
};

// 获取任务详情
const fetchTaskDetail = async () => {
  try {
    loading.value = true;
    const { data } = await getTaskDetailApi(props.taskData.ID);
    detailData.value = {
      ...props.taskData,
      ...data,
    };
  } catch (error) {
    console.error("获取任务详情失败:", error);
    ElMessage.error("获取任务详情失败");
  } finally {
    loading.value = false;
  }
};

// 格式化时间
const formatDateTime = (time) => {
  if (!time) return "-";
  return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
};

// 任务状态映射
const statusMap = {
  running: "运行中",
  stopped: "已停止",
  error: "错误",
};

// 添加选中状态管理
const selectedEnbs = ref([]);

// 处理选中变化
const handleEnbChange = (value) => {
  selectedEnbs.value = value;
};

// 获取ENB状态对应的类型
const getStatusType = (status) => {
  const typeMap = {
    running: "success",
    stopped: "info",
    error: "danger",
  };
  return typeMap[status] || "info";
};

// 添加批量删除方法
const handleBatchDelete = async () => {
  if (!selectedEnbs.value.length) {
    ElMessage.warning("请选择要删除的ENB");
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedEnbs.value.length} 个ENB吗？`,
      "删除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );
    const params = {
      removeEnbs: selectedEnbs.value,
      addEnbs: [],
    };
    await updateENBidsApi(props.taskData.ID, params);
    // 调用删除接口
    console.log("删除的ENB IDs:", selectedEnbs.value);
    ElMessage.success("删除成功");
    await fetchTaskDetail(); // 重新获取数据
    selectedEnbs.value = []; // 清空选中
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};

// 批量添加相关
const batchInput = ref("");

// 处理批量添加
const handleBatchAdd = async () => {
  if (!batchInput.value.trim()) {
    ElMessage.warning("请输入ENB ID");
    return;
  }

  try {
    // 只按换行符分割，并过滤
    const enbIds = [
      ...new Set(
        batchInput.value
          .split("\n")
          .map((id) => id.trim())
          .filter((id) => id && /^\d+$/.test(id))
      ),
    ];

    if (!enbIds.length) {
      ElMessage.warning("请输入有效的ENB ID（必须为数字）");
      return;
    }

    // 检查是否有重复添加
    const existingIds = (detailData.value.enbTasks || []).map(
      (enb) => enb.eNodeBID
    );
    const newIds = enbIds.filter((id) => !existingIds.includes(id));

    if (!newIds.length) {
      ElMessage.warning("所有ENB ID都已存在");
      return;
    }

    await ElMessageBox.confirm(
      `确定要添加这 ${newIds.length} 个ENB吗？${
        enbIds.length !== newIds.length
          ? `\n（${enbIds.length - newIds.length}个重复ID已被过滤）`
          : ""
      }`,
      "添加确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );
    const params = {
      addEnbs: newIds,
      removeEnbs: [],
    };
    await updateENBidsApi(props.taskData.ID, params);
    // TODO: 调用添加接口
    console.log("添加的ENB IDs:", newIds);
    ElMessage.success("添加成功");
    await fetchTaskDetail(); // 重新获取数据
    batchInput.value = ""; // 清空输入
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("添加失败");
    }
  }
};

// 添加搜索相关的响应式变量
const searchKeyword = ref('');

// 添加计算属性来过滤ENB任务列表
const filteredEnbTasks = computed(() => {
  if (!searchKeyword.value) {
    return detailData.value.enbTasks || [];
  }
  return (detailData.value.enbTasks || []).filter(enb =>
    String(enb.eNodeBID).includes(searchKeyword.value.trim())
  );
});
</script>

<template>
  <el-dialog
    title="任务详情"
    v-model="dialogVisible"
    width="800px"
    @close="handleClose"
    destroy-on-close
    v-loading="loading"
  >
    <div class="detail-content">
      <!-- 第一行：任务名称和时间信息 -->
      <div class="detail-header">
        <div class="task-name">
          <h3>{{ detailData.Name || taskData.Name }}</h3>
        </div>
        <div class="task-time">
          <el-tag size="small" type="info">
            {{ formatDateTime(detailData.StartTime || taskData.StartTime) }} ~
            {{ formatDateTime(detailData.EndTime || taskData.EndTime) }}
          </el-tag>
        </div>
      </div>

      <el-divider />

      <!-- ENB任务列表 -->
      <div class="enb-tasks-section">
        <div class="section-header">
          <div class="header-left">
            <h4 class="section-title">ENB任务列表</h4>
            <span class="enb-count"
              >共 {{ detailData.enbTasks?.length || 0 }} 个</span
            >
          </div>
          <div class="header-right">
            <!-- 添加搜索输入框 -->
            <el-input
              v-model="searchKeyword"
              placeholder="搜索ENB ID"
              clearable
              class="search-input"
              size="small"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button
              type="danger"
              size="small"
              :disabled="!selectedEnbs.length"
              @click="handleBatchDelete"
            >
              批量删除
            </el-button>
          </div>
        </div>

        <div class="enb-box" v-if="filteredEnbTasks.length">
          <el-checkbox-group v-model="selectedEnbs">
            <div class="checkbox-wrap">
              <el-checkbox
                v-for="enb in filteredEnbTasks"
                :key="enb.eNodeBID"
                :label="enb.eNodeBID"
                class="checkbox-item"
              >
                {{ enb.eNodeBID }}
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </div>

        <el-empty v-else :description="searchKeyword ? '无搜索结果' : '暂无ENB任务数据'" />
      </div>

      <!-- 批量添加输入框 -->
      <div class="batch-add-section">
        <div class="batch-add-header">
          <h4 class="section-title">批量添加ENB</h4>
        </div>
        <el-input
          v-model="batchInput"
          type="textarea"
          :rows="4"
          placeholder="请输入ENB ID，每行一个（仅支持数字）"
          resize="none"
        />
        <div class="batch-add-tips">每行输入一个ENB ID</div>
        <div class="batch-add-footer">
          <el-button type="primary" size="small" @click="handleBatchAdd">
            确定添加
          </el-button>
        </div>
      </div>
    </div>

    <template #footer>
      <span class="selected-count" v-if="detailData.enbTasks?.length">
        已选择 {{ selectedEnbs.length }} 项
      </span>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.detail-content {
  padding: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-name h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.task-time {
  color: #909399;
}

:deep(.el-tag) {
  border-radius: 4px;
}

.enb-tasks-section {
  margin-top: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0;
}

.enb-count {
  color: #909399;
  font-size: 14px;
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  width: 200px;
}

.batch-add-section {
  margin-top: 24px;
  background-color: #f5f7fa; /* 改为与ENB列表相同的背景色 */
  padding: 16px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.batch-add-header {
  margin-bottom: 16px;
}

.enb-box {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.checkbox-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
}

.checkbox-item {
  min-width: 120px;
}

:deep(.el-checkbox-group) {
  width: 100%;
}

:deep(.el-checkbox) {
  margin-right: 0;
  margin-bottom: 0;
}

.selected-count {
  margin-right: 16px;
  color: #909399;
}

/* 调整文本框样式 */
:deep(.el-textarea__inner) {
  font-family: monospace;
  font-size: 14px;
}

.batch-add-tips {
  font-size: 12px;
  color: #909399;
  margin: 8px 0;
}

.batch-add-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  gap: 8px;
}
</style>
