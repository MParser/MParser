<script setup>
import { onMounted, ref } from "vue";
import {
  getParserApi,
  updateParserApi,
  deleteParserApi,
} from "@/apis/MParser/parser";
import { getNdsApi } from "@/apis/MParser/nds";
import { ElMessage, ElMessageBox } from "element-plus";
import { Refresh, Plus, Delete, Edit } from "@element-plus/icons-vue";
import editDialog from "./components/edit-dialog/index.vue";
import bindGatewayDialog from "./components/bind-gateway-dialog/index.vue";

const parserList = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const currentParserId = ref(null);

const ndsList = ref([]);
const getNdsList = async () => {
  const { list } = await getNdsApi();
  ndsList.value = list;
};

// 获取解析器列表数据
const fetchParserList = async () => {
  try {
    loading.value = true;
    const data = await getParserApi();
    parserList.value = data;
    console.log(parserList.value, "===parserList");
  } catch (error) {
    ElMessage.error("获取解析器列表失败");
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await getNdsList();
  fetchParserList();
});

const handleSwitchChange = async (item) => {
  try {
    await updateParserApi(item);
    ElMessage.success("更新成功");
    await fetchParserList();
  } catch (error) {
    ElMessage.error("更新失败");
  }
};

// 手动刷新方法
const handleRefresh = () => {
  fetchParserList();
};

// 添加单个解析器刷新方法
const refreshSingleParser = async (id) => {
  try {
    loading.value = true;
    const { list } = await getParserApi();
    const updatedParser = list.find((item) => item.ID === id);
    if (updatedParser) {
      const index = parserList.value.findIndex((item) => item.ID === id);
      if (index !== -1) {
        parserList.value[index] = updatedParser;
      }
    }
    ElMessage.success("数据刷新成功");
  } catch (error) {
    ElMessage.error("数据刷新失败");
  } finally {
    loading.value = false;
  }
};

const handleEdit = (parserId) => {
  const currentParser = parserList.value.find((item) => item.ID === parserId);
  if (!currentParser) {
    ElMessage.error("未找到解析器数据");
    return;
  }
  currentParserId.value = parserId;
  dialogVisible.value = true;
};

const handleAdd = () => {
  currentParserId.value = null;
  dialogVisible.value = true;
};

const handleDialogSuccess = async () => {
  // 刷新列表
  await getNdsList();
  await fetchParserList();
};

// 添加删除方法
const handleDelete = async (item) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除解析器 "${item.NodeName}" 吗？`,
      "删除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    await deleteParserApi(item.ID);
    ElMessage.success("删除成功");
    await fetchParserList();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "删除失败");
    }
  }
};

const getParserInfo = (id) => {
  if (!id) return {};
  const parser = parserList.value.find((item) => item.ID === id);
  return parser || {};
};

const bindGatewayVisible = ref(false);
const currentBindParserId = ref(null);
const currentGatewayId = ref(null);

const handleBindGateway = (parser) => {
  currentBindParserId.value = parser.ID;
  currentGatewayId.value = parser.GatewayID;
  bindGatewayVisible.value = true;
};
</script>

<template>
  <div class="card-container">
    <global-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>解析器列表</span>
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

      <div class="parser-grid" v-loading="loading">
        <el-card v-for="item in parserList" :key="item.ID" class="parser-item">
          <div class="parser-header">
            <div class="header-left">
              <span class="node-name">{{ item.NodeName }}</span>
              <el-button
                class="refresh-btn"
                :icon="Refresh"
                circle
                size="small"
                @click="refreshSingleParser(item.ID)"
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
                class="parser-switch"
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

          <div class="parser-info">
            <div class="info-item">
              <span class="label">ID:</span>
              <span class="value">{{ item.ID }}</span>
            </div>
            <div class="info-item">
              <span class="label">网关名称:</span>
              <!-- <span class="value">{{ item?.gateway?.NodeName }}</span> -->
              <el-tag
                :type="item?.gateway?.NodeName ? 'success' : 'warning'"
                size="small"
              >
                {{ item?.gateway?.NodeName }}
              </el-tag>
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
            <div class="info-item">
              <span class="label">线程数:</span>
              <span class="value">{{ item.Threads }}</span>
            </div>
            <div class="info-item">
              <span class="label">状态:</span>
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
        :parser-id="currentParserId"
        :parser-info="
          currentParserId
            ? parserList.find((item) => item.ID === currentParserId) ?? {}
            : {}
        "
        @success="handleDialogSuccess"
      />

      <!-- 添加绑定网关弹窗 -->
      <bind-gateway-dialog
        v-model:visible="bindGatewayVisible"
        :parser-id="currentBindParserId"
        :current-gateway-id="currentGatewayId"
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

.parser-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
  padding: 20px;
  min-height: 200px;
}

.parser-item {
  transition: all 0.3s;
  padding: 10px;
}

.parser-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.parser-header {
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

.parser-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 10px;
}

.info-item {
  display: flex;
  align-items: center;
  min-width: 0;
}

.label {
  color: #909399;
  width: 70px;
  flex-shrink: 0;
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
</style>
