<template>
  <div class="role-container">
    <el-card class="role-card">
      <template #header>
        <div class="role-header">
          <span>角色列表</span>
          <el-button type="primary" size="small" @click="handleAdd">添加角色</el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="roleList"
        border
      >
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="code" label="角色编码" />
        <el-table-column prop="description" label="角色描述" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button-group>
              <el-button
                type="primary"
                :icon="Edit"
                size="small"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                :icon="Delete"
                size="small"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑角色对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加角色' : '编辑角色'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入角色描述"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="formData.status"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  getRoleList,
  addRole,
  updateRole,
  deleteRole
} from "@/apis/sys/role";
import { Delete, Edit } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { onMounted, ref } from "vue";

// 角色列表数据
const roleList = ref([]);
const loading = ref(false);

// 对话框相关
const dialogVisible = ref(false);
const dialogType = ref("add");
const formRef = ref(null);
const formData = ref({
  name: "",
  code: "",
  description: "",
  status: 1
});

// 表单验证规则
const formRules = {
  name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入角色编码", trigger: "blur" }],
  description: [{ required: true, message: "请输入角色描述", trigger: "blur" }]
};

// 统一的错误处理函数
const handleApiError = (error, defaultMessage) => {
  console.error(defaultMessage, error);
  ElMessage.error(error.message || defaultMessage);
  return false;
};

// 获取角色列表
const fetchRoleList = async () => {
  loading.value = true;
  try {
    const data = await getRoleList();
    if (data) {
      roleList.value = data;
    }
  } catch (error) {
    handleApiError(error, "获取角色列表失败");
  } finally {
    loading.value = false;
  }
};

// 添加角色
const handleAdd = () => {
  dialogType.value = "add";
  formData.value = {
    name: "",
    code: "",
    description: "",
    status: 1
  };
  dialogVisible.value = true;
};

// 编辑角色
const handleEdit = (row) => {
  dialogType.value = "edit";
  formData.value = { ...row };
  dialogVisible.value = true;
};

// 删除角色
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认删除角色"${row.name}"吗？`,
      "删除确认",
      {
        type: "warning"
      }
    );

    loading.value = true;
    const result = await deleteRole(row.id);
    if (result) {
      ElMessage.success("删除成功");
      await fetchRoleList();
    }
  } catch (error) {
    if (error !== "cancel") {
      handleApiError(error, "删除角色失败");
    }
  } finally {
    loading.value = false;
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const handler = dialogType.value === "add" ? addRole : updateRole;
        const result = await handler(formData.value);
        if (result) {
          ElMessage.success(dialogType.value === "add" ? "添加成功" : "更新成功");
          dialogVisible.value = false;
          await fetchRoleList();
        }
      } catch (error) {
        handleApiError(error, dialogType.value === "add" ? "添加角色失败" : "更新角色失败");
      } finally {
        loading.value = false;
      }
    }
  });
};

// 页面加载时获取角色列表
onMounted(() => {
  fetchRoleList();
});
</script>

<style scoped>
.role-container {
  height: calc(100vh - 170px);
  box-sizing: border-box;
}

.role-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color);
}

:deep(.el-card__header) {
  padding: 0;
  border-bottom: none;
}

:deep(.el-card__body) {
  flex: 1;
  overflow: hidden;
  padding: 0;
}

:deep(.el-table) {
  height: 100%;
}

:deep(.el-table__body-wrapper) {
  overflow-y: auto;
}

:deep(.el-button--small) {
  padding: 5px 12px;
}
</style>
