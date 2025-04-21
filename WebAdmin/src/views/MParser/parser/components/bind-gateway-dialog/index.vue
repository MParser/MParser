<script setup>
import { ref, watch, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useVModel } from "@vueuse/core";
import { bindGatewayApi } from "@/apis/MParser/parser";
import { getGatewayListApi } from "@/apis/MParser/gateway";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  parserId: {
    type: [Number, String],
    default: null,
  },
  currentGatewayId: {
    type: [Number, String],
    default: null,
  }
});

const emit = defineEmits(["update:visible", "success"]);
const selfVisible = useVModel(props, "visible", emit);
const formRef = ref(null);
const formLoading = ref(false);
const gatewayList = ref([]);

const getGatewayOptions = async () => {
  try {
    const { list } = await getGatewayListApi();
    gatewayList.value = list;
  } catch (error) {
    ElMessage.error("获取网关列表失败");
  }
};

onMounted(() => {
  getGatewayOptions();
});

const form = ref({
  ID: null,
  GatewayID: null
});

const rules = {
  GatewayID: [{ required: true, message: "请选择网关", trigger: "change" }],
};

watch(
  () => selfVisible.value,
  (newVal) => {
    if (newVal) {
      form.value = {
        ID: props.parserId,
        GatewayID: props.currentGatewayId
      };
    }
  }
);

const submitForm = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    formLoading.value = true;
    await bindGatewayApi(form.value);
    ElMessage.success("绑定成功");
    emit("update:visible", false);
    emit("success");
  } catch (error) {
    ElMessage.error(error.message || "绑定失败");
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
    title="绑定网关"
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
      <el-form-item label="选择网关" prop="GatewayID">
        <el-select
          v-model="form.GatewayID"
          placeholder="请选择网关"
          style="width: 100%"
        >
          <el-option
            v-for="item in gatewayList"
            :key="item.ID"
            :label="item.NodeName"
            :value="item.ID"
          />
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
</style>
