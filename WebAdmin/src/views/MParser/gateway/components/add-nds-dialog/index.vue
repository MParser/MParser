<script setup>
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { useVModel } from "@vueuse/core";
import { updateGatewayNdsApi, getGatewayNdsApi } from "@/apis/MParser/gateway";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  gatewayId: {
    type: [Number, String],
    default: null,
  },
  ndsList: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:visible", "success"]);
const selfVisible = useVModel(props, "visible", emit);
const formRef = ref(null);
const formLoading = ref(false);
const form = ref({
  ndsId: [],
  gatewayId: null,
});

const rules = {
  ndsId: [{ required: true, message: "请选择关联节点", trigger: "change" }],
};

// 获取已关联的节点
const fetchGatewayNds = async (gatewayId) => {
  try {
    const data = await getGatewayNdsApi(gatewayId);
    form.value.ndsId = data.map(item => item.ID);
  } catch (error) {
    console.log(error);
    ElMessage.error("获取关联节点失败");
  }
};

// 监听 props.visible 变化
watch(
  () => selfVisible.value,
  async (newVal) => {
    if (newVal && props.gatewayId) {
      form.value = {
        ndsId: [],
        gatewayId: props.gatewayId,
      };
      // 获取已关联的节点数据
      await fetchGatewayNds(props.gatewayId);
    }
  }
);

const submitForm = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    formLoading.value = true;
    await updateGatewayNdsApi(form.value);
    ElMessage.success("添加成功");
    emit("update:visible", false);
    emit("success");
  } catch (error) {
    ElMessage.error(error.message || "添加失败");
  } finally {
    formLoading.value = false;
  }
};

const handleCancel = () => {
  emit("update:visible", false);
  formRef.value?.resetFields();
};
</script>

<template>
  <el-dialog
    v-model="selfVisible"
    title="关联节点"
    width="500px"
    :close-on-click-modal="false"
    @close="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      :disabled="formLoading"
    >
      <el-form-item label="关联节点" prop="ndsId">
        <el-select
          v-model="form.ndsId"
          placeholder="请选择关联节点"
          style="width: 100%"
          multiple
          collapse-tags
        >
          <el-option
            v-for="item in ndsList"
            :key="item.ID"
            :label="item.Name"
            :value="item.ID"
          >
            <div class="nds-option">
              <span>{{ item.Name }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="formLoading">
          确认
        </el-button>
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

.nds-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.nds-option-info {
  color: #909399;
  font-size: 12px;
}
</style>
