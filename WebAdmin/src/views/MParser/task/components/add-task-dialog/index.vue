<script setup>
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { addTaskApi } from "@/apis/MParser/task";
import { useVModel } from "@vueuse/core";
import dayjs from 'dayjs';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:visible", "success", "close"]);

// 使用useVModel处理visible
const dialogVisible = useVModel(props, "visible", emit);

const formRef = ref(null);
const loading = ref(false);

const formData = ref({
  TaskName: "",
  Type: "",
  StartTime: null,
  EndTime: null,
  Status: "stopped",
  eNodeBIDs: "",
});

watch(dialogVisible, (newVal) => {
  console.log(formData.value, "===form");
});

// 添加时间校验函数
const validateEndTime = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请选择结束时间"));
  } else if (!formData.value.StartTime) {
    callback(new Error("请先选择开始时间"));
  } else if (new Date(value) <= new Date(formData.value.StartTime)) {
    callback(new Error("结束时间必须大于开始时间"));
  } else {
    callback();
  }
};

const rules = {
  TaskName: [
    { required: true, message: "请输入任务名称", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" },
  ],
  Type: [{ required: true, message: "请选择任务类型", trigger: "change" }],
  StartTime: [{ required: true, message: "请选择开始时间", trigger: "change" }],
  EndTime: [
    { required: true, message: "请选择结束时间", trigger: "change" },
    { validator: validateEndTime, trigger: "change" },
  ],
  eNodeBIDs: [{ required: true, message: "请输入基站ID列表", trigger: "blur" }],
};

const taskTypes = [
  { label: "MRO", value: "MRO" },
  { label: "MDT", value: "MDT" },
];

// 重置表单
const resetForm = () => {
  formData.value = {
    TaskName: "",
    Type: "",
    StartTime: null,
    EndTime: null,
    Status: "stopped",
    eNodeBIDs: "",
  };
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
  emit("close");
  resetForm();
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    // 处理基站ID列表
    const eNodeBIDsArray = formData.value.eNodeBIDs
      .split("\n")
      .map((id) => id.trim())
      .filter((id) => id); // 过滤空行

    loading.value = true;
    await addTaskApi({
      ...formData.value,
      eNodeBIDs: eNodeBIDsArray, // 将字符串转换为数组
    });
    ElMessage.success("添加成功");
    emit("success");
    dialogVisible.value = false;
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "添加失败");
    }
  } finally {
    loading.value = false;
  }
};

// 添加时间步长和禁用时间的处理函数
const disabledMinutes = (hour) => {
  const minutes = [];
  for (let i = 0; i < 60; i++) {
    if (i % 15 !== 0) { // 只允许选择0、15、30、45分钟
      minutes.push(i);
    }
  }
  return minutes;
};

const handleStartTimeChange = (val) => {
  if (!val) return;

  const roundedDate = dayjs(val)
    .minute(Math.floor(dayjs(val).minute() / 15) * 15)
    .second(0)
    .format('YYYY-MM-DD HH:mm:ss');

  formData.value.StartTime = roundedDate;
};

const handleEndTimeChange = (val) => {
  const roundedDate = dayjs(val)
    .minute(Math.floor(dayjs(val).minute() / 15) * 15)
    .second(0)
    .format('YYYY-MM-DD HH:mm:ss');

  formData.value.EndTime = roundedDate;
};
</script>

<template>
  <el-dialog
    title="新增任务"
    v-model="dialogVisible"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      :disabled="loading"
    >
      <el-form-item label="任务名称" prop="TaskName">
        <el-input
          v-model="formData.TaskName"
          placeholder="请输入任务名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="任务类型" prop="Type">
        <el-select
          v-model="formData.Type"
          placeholder="请选择任务类型"
          style="width: 100%"
        >
          <el-option
            v-for="item in taskTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="开始时间" prop="StartTime">
        <el-date-picker
          v-model="formData.StartTime"
          type="datetime"
          placeholder="请选择开始时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          :step="900"
          style="width: 100%"
          @change="handleStartTimeChange"
        />
      </el-form-item>

      <el-form-item label="结束时间" prop="EndTime">
        <el-date-picker
          v-model="formData.EndTime"
          type="datetime"
          placeholder="请选择结束时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          :step="900"
          style="width: 100%"
          @change="handleEndTimeChange"
        />
      </el-form-item>

      <el-form-item label="基站ID列表" prop="eNodeBIDs">
        <el-input
          v-model="formData.eNodeBIDs"
          type="textarea"
          :rows="4"
          placeholder="请输入基站ID列表，每行一个ID"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          确定
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
