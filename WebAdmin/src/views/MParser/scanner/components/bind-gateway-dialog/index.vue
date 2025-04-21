<script setup>
import { ref, watch, computed } from "vue";
import { useVModel } from "@vueuse/core";
import { ElMessage } from "element-plus";
import {
  bindGatewayApi,
  removeScannerApi,
  bindNdsApi,
} from "@/apis/MParser/scanner";
import { getGatewayListApi, getGatewayNdsApi } from "@/apis/MParser/gateway";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  scannerId: {
    type: [Number, String],
    default: null,
  },
  currentGatewayId: {
    type: [Number, String],
    default: null,
  },
  boundNdsList: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:visible", "success"]);
const selfVisible = useVModel(props, "visible", emit);

const loading = ref(false);
const gatewayList = ref([]);
const selectedGatewayId = ref(null);
const selectedNdsIds = ref([]);
const ndsList = ref([]);

const unselectedNdsList = computed(() => {
  return ndsList.value.filter((nds) => !selectedNdsIds.value.includes(nds.ID));
});

// 获取网关列表
const fetchGatewayList = async () => {
  try {
    loading.value = true;
    const { list } = await getGatewayListApi();
    gatewayList.value = list || [];
  } catch (error) {
    ElMessage.error("获取网关列表失败");
  } finally {
    loading.value = false;
  }
};

// 监听弹窗显示，加载网关列表
watch(
  () => selfVisible.value,
  async (val) => {
    if (val) {
      selectedGatewayId.value = props.currentGatewayId;
      selectedNdsIds.value = props.boundNdsList.map((nds) => nds.ID);
      console.log(selectedNdsIds.value, "===selectedNdsIds");

      if (selectedGatewayId.value) {
        // 先获取网关列表，再处理网关变更
        await fetchGatewayList();
        await handleGatewayChange(selectedGatewayId.value);
      } else {
        await fetchGatewayList();
      }
    } else {
      selectedGatewayId.value = null;
      selectedNdsIds.value = [];
      ndsList.value = [];
    }
  }
);

// 当选择网关时，加载该网关下的NDS列表
const handleGatewayChange = async (gatewayId) => {
  if (!gatewayId) {
    ndsList.value = [];
    selectedNdsIds.value = [];
    return;
  }

  try {
    loading.value = true;
    // 先绑定网关
    await bindGatewayApi(props.scannerId, gatewayId);
    const data = await getGatewayNdsApi(gatewayId);

    if (data && data.length) {
      ndsList.value = data;
      // 如果选择的是当前已绑定的网关，回显已绑定的NDS
      if (gatewayId === props.currentGatewayId) {
        selectedNdsIds.value = props.boundNdsList.map((nds) => nds.ID);
      } else {
        selectedNdsIds.value = [];
      }
    } else {
      ndsList.value = [];
      selectedNdsIds.value = [];
    }
    emit("success");
  } catch (error) {
    ndsList.value = [];
    selectedNdsIds.value = [];
    ElMessage.error(error.message || "操作失败");
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  selfVisible.value = false;
  selectedGatewayId.value = null;
  selectedNdsIds.value = [];
  ndsList.value = [];
};

const handleBindNds = async (nds) => {
  if (!selectedGatewayId.value) {
    ElMessage.warning("请先选择网关");
    return;
  }

  try {
    loading.value = true;
    const newNdsIds = [...selectedNdsIds.value, nds.ID];
    await bindNdsApi(props.scannerId, newNdsIds);
    ElMessage.success("绑定成功");
    selectedNdsIds.value = newNdsIds;
    emit("success");
  } catch (error) {
    ElMessage.error(error.message || "绑定失败");
  } finally {
    loading.value = false;
  }
};

const handleUnbindNds = async (ndsId) => {
  if (!selectedGatewayId.value) {
    ElMessage.warning("请先选择网关");
    return;
  }

  try {
    loading.value = true;
    const remainingNdsIds = selectedNdsIds.value.filter((id) => id !== ndsId);

    // if (remainingNdsIds.length > 0) {
    //   await bindNdsApi(props.scannerId, remainingNdsIds);
    // } else {
    await removeScannerApi({
      scannerId: props.scannerId,
      ndsIds: [ndsId],
    });
    // }

    ElMessage.success("解绑成功");
    selectedNdsIds.value = remainingNdsIds;
    emit("success");
  } catch (error) {
    ElMessage.error(error.message || "解绑失败");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <el-dialog
    title="绑定网关"
    v-model="selfVisible"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <el-form label-width="100px" :disabled="loading">
      <el-form-item label="选择网关">
        <el-select
          v-model="selectedGatewayId"
          placeholder="请选择网关"
          clearable
          @change="handleGatewayChange"
        >
          <el-option
            v-for="item in gatewayList"
            :key="item.ID"
            :label="item.NodeName"
            :value="item.ID"
          >
            <span
              :style="{
                color:
                  item.ID === props.currentGatewayId
                    ? 'var(--el-color-primary)'
                    : '',
              }"
            >
              {{ item.NodeName }}
              {{ item.ID === props.currentGatewayId ? "(当前已绑定)" : "" }}
            </span>
          </el-option>
        </el-select>
      </el-form-item>

      <template v-if="selectedGatewayId">
        <el-form-item label="已绑定NDS">
          <div class="nds-list">
            <div v-if="selectedNdsIds.length" class="nds-tags">
              <el-tag
                v-for="nds in ndsList.filter((n) =>
                  selectedNdsIds.includes(n.ID)
                )"
                :key="nds.ID"
                type="success"
                closable
                :disabled="!selectedGatewayId"
                @close="handleUnbindNds(nds.ID)"
              >
                {{ nds.Name }}
              </el-tag>
            </div>
            <div v-else class="empty-text">暂无已绑定NDS</div>
          </div>
        </el-form-item>

        <el-form-item label="可绑定NDS">
          <div class="nds-list">
            <div v-if="unselectedNdsList.length" class="nds-tags">
              <el-tag
                v-for="nds in unselectedNdsList"
                :key="nds.ID"
                class="bindable-tag"
                @click="handleBindNds(nds)"
              >
                {{ nds.Name }}
              </el-tag>
            </div>
            <div v-else class="empty-text">暂无可绑定NDS</div>
          </div>
        </el-form-item>
      </template>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.el-select {
  width: 100%;
}

.nds-list {
  min-height: 32px;
}

.nds-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.nds-tag-selected {
  background-color: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  cursor: pointer;
}

:deep(.el-tag) {
  cursor: pointer;
}

:deep(.el-tag:hover) {
  background-color: var(--el-color-primary-light-9);
}

.bindable-tag {
  cursor: pointer;
  background-color: var(--el-color-info-light-9);
}

.bindable-tag:hover {
  background-color: var(--el-color-success-light-9) !important;
  border-color: var(--el-color-success);
  color: var(--el-color-success);
}

.empty-text {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  text-align: center;
  padding: 8px 0;
}

:deep(.el-tag.is-disabled) {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
