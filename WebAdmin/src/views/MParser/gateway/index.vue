<script setup>
import { onMounted, ref } from "vue";
import {
  getGatewayListApi,
  updateGatewayApi,
  deleteGatewayApi,
} from "@/apis/MParser/gateway";
import { getNdsApi } from "@/apis/MParser/nds";
import { ElMessage, ElMessageBox } from "element-plus";
import { Refresh, Plus, Delete } from "@element-plus/icons-vue";
import AddNdsDialog from "./components/add-nds-dialog/index.vue";


const gatewayList = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const currentGatewayId = ref(null);

const ndsList = ref([]);
const getNdsList = async () => {
  const data= await getNdsApi();
  ndsList.value = data;
};
// 获取网关列表数据
const fetchGatewayList = async () => {
  try {
    loading.value = true;
    const data = await getGatewayListApi();
    gatewayList.value = data;
  } catch (error) {
    ElMessage.error("获取网关列表失败");
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await getNdsList();
  fetchGatewayList();
});

const handleSwitchChange = async (item) => {

  await updateGatewayApi(item);
  // 更新成功后刷新列表
  await fetchGatewayList();

};

// 手动刷新方法
const handleRefresh = () => {
  fetchGatewayList();
};

// 添加单个网关刷新方法
const refreshSingleGateway = async (id) => {
  try {
    loading.value = true;
    const { list } = await getGatewayListApi();
    // 只更新对应ID的网关数据
    const updatedGateway = list.find((item) => item.id === id);
    if (updatedGateway) {
      const index = gatewayList.value.findIndex((item) => item.id === id);
      if (index !== -1) {
        gatewayList.value[index] = updatedGateway;
      }
    }
    ElMessage.success("数据刷新成功");
  } catch (error) {
    ElMessage.error("数据刷新失败");
  } finally {
    loading.value = false;
  }
};

const handleAdd = (gatewayId) => {
  currentGatewayId.value = gatewayId;
  dialogVisible.value = true;
};

const handleDialogSuccess = async () => {
  // 刷新列表
  await getNdsList();
  await fetchGatewayList();
};

// 添加删除方法
const handleDelete = async (item) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除网关 "${item.name}" 吗？`,
      "删除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    await deleteGatewayApi(item.id);
    ElMessage.success("删除成功");
    await fetchGatewayList();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "删除失败");
    }
  }
};
</script>

<template>
  <div class="card-container">
    <el-card>
      <div class="gateway-grid" v-loading="loading">
        <el-card
          v-for="item in gatewayList"
          :key="item.id"
          class="gateway-item"
        >
          <div class="gateway-header">
            <div class="header-left">
              <span class="node-name">{{ item.name }}</span>
              <el-button
                class="refresh-btn"
                :icon="Refresh"
                circle
                size="small"
                @click="refreshSingleGateway(item.id)"
              />
            </div>
            <div class="header-right">
              <!-- <el-button
                type="primary"
                :icon="Plus"
                circle
                size="small"
                @click="handleAdd(item.id)"
                class="add-btn"
              /> -->
              <!-- <el-switch
                v-model="item.switch"
                :active-value="1"
                :inactive-value="0"
                class="gateway-switch"
                @change="handleSwitchChange(item)"
              /> -->
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

          <div class="gateway-info">
            <div class="info-item">
              <span class="label">ID:</span>
              <span class="value">{{ item.id }}</span>
            </div>
            <div class="info-item">
              <span class="label">Host:</span>
              <span class="value">{{ item.host }}</span>
            </div>
            <div class="info-item">
              <span class="label">端口:</span>
              <span class="value">{{ item.port }}</span>
            </div>
            <div class="info-item">
              <span class="label">状态:</span>
              <el-tag
                :type="item.status === 1 ? 'success' : 'danger'"
                size="small"
              >
                {{ item.status === 1 ? "正常" : "异常" }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 替换原有的 el-dialog 为新组件 -->
      <add-nds-dialog
        v-model:visible="dialogVisible"
        :gateway-id="currentGatewayId"
        :nds-list="ndsList"
        @success="handleDialogSuccess"
      />
    </el-card>
  </div>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}

.gateway-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
  min-height: 200px;
}

.gateway-item {
  transition: all 0.3s;
}

.gateway-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.gateway-header {
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

.gateway-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
}

.label {
  color: #909399;
  width: 60px;
}

.value {
  color: #303133;
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.add-btn {
  padding: 4px;
  height: 24px;
  width: 24px;
}

.add-btn :deep(.el-icon) {
  font-size: 14px;
}

.delete-btn {
  padding: 4px;
  height: 24px;
  width: 24px;
}

.delete-btn :deep(.el-icon) {
  font-size: 14px;
}
</style>
