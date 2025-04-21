<script setup>
import { ref, watch } from "vue";
import { createNdsApi, updateNdsApi } from "@/apis/MParser/nds";
import { ElMessage } from "element-plus";
import { useVModel } from "@vueuse/core";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  editData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:visible", "success", "close"]);

const selfVisible = useVModel(props, "visible", emit);
const formRef = ref(null);
const loading = ref(false);

const formData = ref({
  Name: "",
  Account: "",
  Password: "",
  Address: "",
  Port: "",
  Protocol: "",
  MDT_Path: "",
  MDT_Filter: "",
  MRO_Path: "",
  MRO_Filter: "",
  Switch: 1,
});

const rules = {
  Name: [{ required: true, message: "请输入节点名称", trigger: "blur" }],
  Account: [{ required: true, message: "请输入账号", trigger: "blur" }],
  Password: [{ required: true, message: "请输入密码", trigger: "blur" }],
  Address: [{ required: true, message: "请输入地址", trigger: "blur" }],
  Port: [
    { required: true, message: "请输入端口", trigger: "blur" },
    {
      type: "number",
      message: "端口必须为数字",
      trigger: "blur",
      transform: (value) => Number(value),
    },
  ],
  Protocol: [{ required: true, message: "请选择协议", trigger: "change" }],
  MDT_Path: [{ required: true, message: "请输入MDT路径", trigger: "blur" }],
  MDT_Filter: [{ required: true, message: "请输入MDT过滤", trigger: "blur" }],
  MRO_Path: [{ required: true, message: "请输入MRO路径", trigger: "blur" }],
  MRO_Filter: [{ required: true, message: "请输入MRO过滤", trigger: "blur" }],
};

// 监听编辑数据
watch(
  () => props.editData,
  (newVal) => {
    if (newVal) {
      formData.value = { ...newVal };
    } else {
      formData.value = {
        Name: "",
        Account: "",
        Password: "",
        Address: "",
        Port: "",
        Protocol: "",
        MDT_Path: "",
        MDT_Filter: "",
        MRO_Path: "",
        MRO_Filter: "",
        Switch: 1,
      };
    }
  },
  { immediate: true }
);

const handleClose = () => {
  selfVisible.value = false;
  formRef.value?.resetFields();
  emit("close");
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    const api = props.editData ? updateNdsApi : createNdsApi;
    const res = await api(formData.value);
    ElMessage.success(props.editData ? "修改成功" : "添加成功");
    handleClose();
    emit("success");
  } catch (error) {
    console.error(
      props.editData ? "修改NDS节点失败:" : "添加NDS节点失败:",
      error
    );
    ElMessage.error(props.editData ? "修改失败" : "添加失败");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <el-dialog
    :title="editData ? '编辑NDS节点' : '添加NDS节点'"
    v-model="selfVisible"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="right"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="节点名称" prop="Name">
            <el-input v-model="formData.Name" placeholder="请输入节点名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="账号" prop="Account">
            <el-input v-model="formData.Account" placeholder="请输入账号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="密码" prop="Password">
            <el-input
              v-model="formData.Password"
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="地址" prop="Address">
            <el-input v-model="formData.Address" placeholder="请输入地址" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="端口" prop="Port">
            <el-input v-model.number="formData.Port" placeholder="请输入端口" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="协议" prop="Protocol">
            <el-select v-model="formData.Protocol" placeholder="请选择协议">
              <el-option label="FTP" value="FTP" />
              <el-option label="SFTP" value="SFTP" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="MDT路径" prop="MDT_Path">
            <el-input v-model="formData.MDT_Path" placeholder="请输入MDT路径" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="MDT过滤" prop="MDT_Filter">
            <el-input
              v-model="formData.MDT_Filter"
              placeholder="请输入MDT过滤"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="MRO路径" prop="MRO_Path">
            <el-input v-model="formData.MRO_Path" placeholder="请输入MRO路径" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="MRO过滤" prop="MRO_Filter">
            <el-input
              v-model="formData.MRO_Filter"
              placeholder="请输入MRO过滤"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="启用状态" prop="Switch">
        <el-switch
          v-model="formData.Switch"
          :active-value="1"
          :inactive-value="0"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.el-row {
  margin-bottom: 20px;
}
</style>
