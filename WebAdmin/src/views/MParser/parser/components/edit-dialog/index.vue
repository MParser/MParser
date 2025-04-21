<script setup>
import { ref, watch, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useVModel } from "@vueuse/core";
import { updateParserApi } from "@/apis/MParser/parser";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  parserId: {
    type: [Number, String],
    default: null,
  },
  parserInfo: {
    type: Object,
    default: () => ({}),
  }
});

const emit = defineEmits(["update:visible", "success"]);
const selfVisible = useVModel(props, "visible", emit);
const formRef = ref(null);
const formLoading = ref(false);

const form = ref({
  ID: null,
  NodeName: "",
  Status: 0,
  Switch: 0,
  Threads: 0
});

const rules = {
  NodeName: [{ required: true, message: "请输入节点名称", trigger: "blur" }],
  Threads: [{ required: true, message: "请输入线程数", trigger: "blur" }],
};

// 监听 visible 变化，初始化表单数据
watch(
  () => selfVisible.value,
  (newVal) => {
    if (newVal) {
      if (props.parserId) {
        // 编辑模式：只复制需要编辑的字段
        const { ID, NodeName, Status, Switch, Threads } = props.parserInfo;
        form.value = {
          ID,
          NodeName,
          Status,
          Switch,
          Threads
        };
      } else {
        // 新增模式：重置表单
        form.value = {
          ID: null,
          NodeName: "",
          Status: 0,
          Switch: 0,
          Threads: 0
        };
      }
    }
  }
);

const submitForm = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    formLoading.value = true;
    await updateParserApi(form.value);
    ElMessage.success(props.parserId ? "更新成功" : "添加成功");
    emit("update:visible", false);
    emit("success");
  } catch (error) {
    ElMessage.error(error.message || (props.parserId ? "更新失败" : "添加失败"));
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
    :title="parserId ? '编辑解析器' : '新增解析器'"
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
      <el-form-item label="节点名称" prop="NodeName">
        <el-input v-model="form.NodeName" placeholder="请输入节点名称" />
      </el-form-item>

      <el-form-item label="线程数" prop="Threads">
        <el-input-number
          v-model="form.Threads"
          :min="1"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="状态">
        <el-select v-model="form.Status" placeholder="请选择状态">
          <el-option :value="1" label="正常" />
          <el-option :value="0" label="异常" />
        </el-select>
      </el-form-item>

      <el-form-item label="开关">
        <el-switch
          v-model="form.Switch"
          :active-value="1"
          :inactive-value="0"
        />
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
