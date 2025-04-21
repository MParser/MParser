<script setup>
import { onMounted, ref } from "vue";
import {
  getScannerApi,
  updateScannerApi,
  deleteScannerApi,
} from "@/apis/MParser/scanner";
import { getNdsApi } from "@/apis/MParser/nds";
import { ElMessage, ElMessageBox } from "element-plus";
import { Refresh, Plus, Delete, Edit } from "@element-plus/icons-vue";
import editDialog from "./components/edit-dialog/index.vue";
import bindGatewayDialog from "./components/bind-gateway-dialog/index.vue";

const scannerList = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const currentScannerId = ref(null);

const ndsList = ref([]);
const getNdsList = async () => {
  const { list } = await getNdsApi();
  ndsList.value = list;
};

// 获取扫描器列表数据
const fetchScannerList = async () => {
  try {
    loading.value = true;
    const data = await getScannerApi();
    scannerList.value = data;
    console.log(scannerList.value, "===scannerList");
  } catch (error) {
    ElMessage.error("获取扫描器列表失败");
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await getNdsList();
  fetchScannerList();
});

const handleSwitchChange = async (item) => {
  try {
    await updateScannerApi(item);
    ElMessage.success("更新成功");
    await fetchScannerList();
  } catch (error) {
    ElMessage.error("更新失败");
  }
};

// 手动刷新方法
const handleRefresh = () => {
  fetchScannerList();
};

// 添加单个扫描器刷新方法
const refreshSingleScanner = async (id) => {
  try {
    loading.value = true;
    await getScannerApi();
    ElMessage.success("数据刷新成功");
  } catch (error) {
    ElMessage.error("数据刷新失败");
  } finally {
    loading.value = false;
  }
};

const handleEdit = (scannerId) => {
  const currentScanner = scannerList.value.find(
    (item) => item.ID === scannerId
  );
  if (!currentScanner) {
    ElMessage.error("未找到扫描器数据");
    return;
  }
  currentScannerId.value = scannerId;
  dialogVisible.value = true;
};

const handleAdd = () => {
  currentScannerId.value = null;
  dialogVisible.value = true;
};

const handleDialogSuccess = async () => {
  // 刷新列表
  await getNdsList();
  await fetchScannerList();
};

// 添加删除方法
const handleDelete = async (item) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除扫描器 "${item.NodeName}" 吗？`,
      "删除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    await deleteScannerApi(item.ID);
    ElMessage.success("删除成功");
    await fetchScannerList();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "删除失败");
    }
  }
};

const getScannerInfo = (id) => {
  if (!id) return {};
  const scanner = scannerList.value.find((item) => item.ID === id);
  return scanner || {};
};

const bindGatewayVisible = ref(false);
const currentBindScannerId = ref(null);
const currentGatewayId = ref(null);

const handleBindGateway = (scanner) => {
  currentBindScannerId.value = scanner.ID;
  currentGatewayId.value = scanner.GatewayID;
  bindGatewayVisible.value = true;
};
</script>

<template>
  <div class="card-container">
    <global-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>扫描器列表</span>
            <el-button type="primary" :icon="Plus" circle @click="handleAdd" />
          </div>
          <el-button
            type="primary"
            :icon="Refresh"
            circle
            @click="handleRefresh"
            :loading="loading"
          />
        </div>
      </template>

      <div class="scanner-grid" v-loading="loading">
        <el-card
          v-for="item in scannerList"
          :key="item.ID"
          class="scanner-item"
        >
          <div class="scanner-header">
            <div class="header-left">
              <span class="node-name">{{ item.NodeName }}</span>
              <el-button
                class="refresh-btn"
                :icon="Refresh"
                circle
                size="small"
                @click="refreshSingleScanner(item.ID)"
              />
            </div>
            <div class="header-right">
              <el-button
                type="primary"
                :icon="Edit"
                circle
                size="small"
                @click="handleEdit(item.ID)"
                class="edit-btn"
              />
              <el-button
                type="success"
                icon="Link"
                circle
                size="small"
                @click="handleBindGateway(item)"
                class="bind-btn"
              />
              <el-switch
                v-model="item.Switch"
                :active-value="1"
                :inactive-value="0"
                class="scanner-switch"
                @change="handleSwitchChange(item)"
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

          <div class="scanner-info">
            <div class="info-item">
              <span class="label">ID:</span>
              <span class="value">{{ item.ID }}</span>
            </div>
            <div class="info-item">
              <span class="label">网关名称:</span>
              <div class="gateway-tags">
                <el-tag
                  v-if="item.gateway?.NodeName"
                  size="small"
                  type="success"
                  class="gateway-tag"
                >
                  {{ item.gateway.NodeName }}
                </el-tag>
                <el-tag v-else size="small" type="info">未绑定</el-tag>
              </div>
            </div>
            <div class="info-item">
              <span class="label">NDS数量:</span>
              <div class="gateway-tags">
                <el-tag size="small" type="success">{{
                  item.ndsList.length
                }}</el-tag>
              </div>
            </div>
            <div class="info-item">
              <span class="label">节点名称:</span>
              <span class="value">{{ item.NodeName }}</span>
            </div>
            <div class="info-item">
              <span class="label">主机:</span>
              <span class="value">{{ item.Host }}</span>
            </div>
            <div class="info-item">
              <span class="label">端口:</span>
              <span class="value">{{ item.Port }}</span>
            </div>
            <!-- <div class="info-item">
              <span class="label">开关状态:</span>
              <el-tag
                :type="item.Switch === 1 ? 'success' : 'info'"
                size="small"
              >
                {{ item.Switch === 1 ? "开启" : "关闭" }}
              </el-tag>
            </div> -->
            <div class="info-item">
              <span class="label">运行状态:</span>
              <el-tag
                :type="item.Status === 1 ? 'success' : 'danger'"
                size="small"
              >
                {{ item.Status === 1 ? "正常" : "异常" }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 替换原有的 el-dialog 为新组件 -->
      <edit-dialog
        v-model:visible="dialogVisible"
        :scanner-id="currentScannerId"
        :scanner-info="
          currentScannerId
            ? scannerList.find((item) => item.ID === currentScannerId) ?? {}
            : {}
        "
        @success="handleDialogSuccess"
      />

      <!-- 添加绑定网关弹窗 -->
      <bind-gateway-dialog
        v-model:visible="bindGatewayVisible"
        :scanner-id="currentBindScannerId"
        :current-gateway-id="currentGatewayId"
        :bound-nds-list="
          currentGatewayId
            ? scannerList.find((item) => item.ID === currentBindScannerId)
                ?.ndsList
            : []
        "
        @success="handleDialogSuccess"
      />
    </global-card>
  </div>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}

.scanner-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
  padding: 20px;
  min-height: 200px;
}

.scanner-item {
  transition: all 0.3s;
  padding: 10px;
}

.scanner-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.scanner-header {
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

.scanner-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 10px;
}

.info-item {
  display: flex;
  align-items: center;
  /* align-items: flex-start; */
  min-width: 0;
  flex-wrap: nowrap;
}

.label {
  color: #909399;
  width: 80px;
  flex-shrink: 0;
  margin-top: 2px;
}

.value {
  color: #303133;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.edit-btn {
  padding: 4px;
  height: 24px;
  width: 24px;
}

.edit-btn :deep(.el-icon) {
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

.bind-btn {
  padding: 4px;
  height: 24px;
  width: 24px;
}

.bind-btn :deep(.el-icon) {
  font-size: 14px;
}

.gateway-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.gateway-tag {
  margin-right: 4px;
}
</style>
