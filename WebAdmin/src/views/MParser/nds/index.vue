<script setup>
import { onMounted, ref } from "vue";
import {
  getNdsApi,
  updateNdsApi,
  deleteNdsApi,
  connectNdsApi,
} from "@/apis/MParser/nds";
import { ElMessage, ElMessageBox, ElLoading } from "element-plus";
import { Refresh, Plus, Delete, Edit, Link } from "@element-plus/icons-vue";
import AddNdsDialog from "./components/add-nds-dialog/index.vue";

const ndsList = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const currentEditItem = ref(null);

// 获取NDS列表数据
const fetchNdsList = async () => {
  try {
    loading.value = true;
    const { list } = await getNdsApi();
    ndsList.value = list;
  } catch (error) {
    ElMessage.error("获取NDS列表失败");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchNdsList();
});

const handleSwitchChange = async (item) => {
  try {
    await updateNdsApi(item);
    ElMessage.success("更新成功");
    await fetchNdsList();
  } catch (error) {
    ElMessage.error("更新失败");
  }
};

// 手动刷新方法
const handleRefresh = () => {
  fetchNdsList();
  ElMessage.success("数据刷新成功");
};

// 添加单个NDS刷新方法
const refreshSingleNds = async (id) => {
  try {
    loading.value = true;
    const { list } = await getNdsApi();
    const updatedNds = list.find((item) => item.ID === id);
    if (updatedNds) {
      const index = ndsList.value.findIndex((item) => item.ID === id);
      if (index !== -1) {
        ndsList.value[index] = updatedNds;
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
  await fetchNdsList();
  currentEditItem.value = null;
};

const handleDialogClose = () => {
  currentEditItem.value = null;
};

// 添加编辑方法
const handleEdit = (item) => {
  currentEditItem.value = { ...item };
  dialogVisible.value = true;
};

// 删除方法
const handleDelete = async (item) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除NDS "${item.Name}" 吗？`,
      "删除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    await deleteNdsApi(item.ID);
    ElMessage.success("删除成功");
    await fetchNdsList();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "删除失败");
    }
  }
};

// 添加连接方法
const handleConnect = async (item) => {
  const loading = ElLoading.service({
    lock: true,
    text: "测试NDS服务器连接...",
    background: "rgba(0, 0, 0, 0.7)",
  });

  try {
    await connectNdsApi(item.ID);
    ElMessage.success("测试完成");
  } catch (error) {
    ElMessage.error(error.message || "测试失败");
  } finally {
    loading.close();
  }
};
</script>

<template>
  <div class="card-container">
    <!-- 添加操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" :icon="Plus" @click="handleAdd"
        >新增NDS</el-button
      >
      <el-button :icon="Refresh" @click="handleRefresh">刷新</el-button>
    </div>

    <div class="nds-grid" v-loading="loading">
      <el-card v-for="item in ndsList" :key="item.ID" class="nds-item">
        <div class="nds-header">
          <div class="header-left">
            <span class="node-name">{{ item.ID }}</span>
            <el-button
              class="refresh-btn"
              :icon="Refresh"
              circle
              size="small"
              @click="refreshSingleNds(item.ID)"
            />
          </div>
          <div class="header-right">
            <el-switch
              v-model="item.Switch"
              :active-value="1"
              :inactive-value="0"
              class="nds-switch"
              @change="handleSwitchChange(item)"
            />
            <el-button
              type="success"
              :icon="Link"
              circle
              size="small"
              @click="handleConnect(item)"
              class="connect-btn"
            />
            <el-button
              type="primary"
              :icon="Edit"
              circle
              size="small"
              @click="handleEdit(item)"
              class="edit-btn"
            />
            <el-button
              type="danger"
              :icon="Delete"
              circle
              size="small"
              @click="handleDelete(item)"
              class="delete-btn"
            />
          </div>
        </div>

        <div class="nds-info">
          <div class="info-grid">
            <div class="info-column">
              <div class="info-item">
                <span class="label">节点名称:</span>
                <span class="value">{{ item.Name }}</span>
              </div>
              <div class="info-item">
                <span class="label">地址:</span>
                <span class="value">{{ item.Address }}</span>
              </div>
              <div class="info-item">
                <span class="label">端口:</span>
                <span class="value">{{ item.Port }}</span>
              </div>
              <div class="info-item">
                <span class="label">协议:</span>
                <span class="value">{{ item.Protocol }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <add-nds-dialog
      v-model:visible="dialogVisible"
      :edit-data="currentEditItem"
      @success="handleDialogSuccess"
      @close="handleDialogClose"
    />
  </div>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}

.nds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 16px;
  padding: 16px;
  min-height: 200px;
}

.nds-item {
  transition: all 0.3s;
}

.nds-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.nds-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.refresh-btn {
  padding: 4px;
  height: 24px;
  width: 24px;
}

.refresh-btn :deep(.el-icon) {
  font-size: 14px;
}

.node-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.nds-info {
  padding: 0 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.info-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
}

.label {
  color: #909399;
  min-width: 70px;
  flex-shrink: 0;
}

.value {
  color: #303133;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 240px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.delete-btn {
  padding: 4px;
  height: 24px;
  width: 24px;
}

.delete-btn :deep(.el-icon) {
  font-size: 14px;
}

/* 添加操作栏样式 */
.operation-bar {
  padding: 20px 20px 0;
  display: flex;
  gap: 12px;
  align-items: center;
}

.edit-btn {
  padding: 4px;
  height: 24px;
  width: 24px;
}

.edit-btn :deep(.el-icon) {
  font-size: 14px;
}

.connect-btn {
  padding: 4px;
  height: 24px;
  width: 24px;
}

.connect-btn :deep(.el-icon) {
  font-size: 14px;
}
</style>
