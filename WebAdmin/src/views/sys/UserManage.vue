<template>
  <div class="user-container">
    <el-card class="user-card">
      <template #header>
        <div class="user-header">
          <div class="header-left">
            <span>用户列表</span>
            <el-button-group class="ml-4">
              <el-button
                type="primary"
                size="small"
                :disabled="!selectedUsers.length"
                @click="handleBatchDepartment"
              >
                批量设置部门
              </el-button>
              <el-button
                type="primary"
                size="small"
                :disabled="!selectedUsers.length"
                @click="handleBatchRole"
              >
                批量设置角色
              </el-button>
              <el-button
                type="danger"
                size="small"
                :disabled="!selectedUsers.length"
                @click="handleBatchDelete"
              >
                批量删除
              </el-button>
            </el-button-group>
          </div>
          <el-button type="primary" size="small" @click="handleAdd">
            添加用户
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="userList"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="departmentName" label="所属部门" />
        <el-table-column prop="roleNames" label="角色">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roleNames"
              :key="role"
              class="mr-1"
            >
              {{ role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column prop="lastLoginTime" label="最后登录" />
        <el-table-column label="操作" width="250">
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
                type="warning"
                :icon="Key"
                size="small"
                @click="handlePassword(row)"
              >
                改密
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

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="部门" prop="departmentId">
          <el-tree-select
            v-model="formData.departmentId"
            :data="departmentOptions"
            node-key="id"
            :props="{
              label: 'name',
              children: 'children'
            }"
            placeholder="请选择部门"
            check-strictly
            @node-click="handleDepartmentSelect"
          />
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select
            v-model="formData.roleIds"
            multiple
            placeholder="请选择角色"
            @change="handleRoleSelect"
          >
            <el-option
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
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

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="400px"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="80px"
      >
        <el-form-item label="新密码" prop="password">
          <el-input
            v-model="passwordForm.password"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请确认新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePasswordSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量设置部门对话框 -->
    <el-dialog
      v-model="batchDepartmentDialogVisible"
      title="批量设置部门"
      width="400px"
    >
      <el-form
        ref="batchDepartmentFormRef"
        :model="batchDepartmentForm"
        :rules="batchDepartmentRules"
        label-width="80px"
      >
        <el-form-item label="部门" prop="departmentId">
          <el-tree-select
            v-model="batchDepartmentForm.departmentId"
            :data="departmentOptions"
            node-key="id"
            :props="{
              label: 'name',
              children: 'children'
            }"
            placeholder="请选择部门"
            check-strictly
            @node-click="handleBatchDepartmentSelect"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchDepartmentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchDepartmentSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量设置角色对话框 -->
    <el-dialog
      v-model="batchRoleDialogVisible"
      title="批量设置角色"
      width="400px"
    >
      <el-form
        ref="batchRoleFormRef"
        :model="batchRoleForm"
        :rules="batchRoleRules"
        label-width="80px"
      >
        <el-form-item label="角色" prop="roleIds">
          <el-select
            v-model="batchRoleForm.roleIds"
            multiple
            placeholder="请选择角色"
            @change="handleBatchRoleSelect"
          >
            <el-option
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchRoleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchRoleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  getUserList,
  addUser,
  updateUser,
  deleteUsers,
  updatePassword,
  batchUpdateDepartment,
  batchUpdateRole
} from "@/apis/sys/usermanage";
import { getRoleList } from "@/apis/sys/role";
import { getDepartmentList } from "@/apis/sys/department";
import { Delete, Edit, Key } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { onMounted, ref } from "vue";

// 用户列表数据
const userList = ref([]);
const loading = ref(false);
const selectedUsers = ref([]);

// 部门和角色选项
const departmentOptions = ref([]);
const roleOptions = ref([]);

// 对话框相关
const dialogVisible = ref(false);
const dialogType = ref("add");
const formRef = ref(null);
const formData = ref({
  username: "",
  email: "",
  password: "",
  departmentId: "",
  departmentName: "",
  roleIds: [],
  roleNames: [],
  status: 1
});

// 表单验证规则
const formRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱格式", trigger: "blur" }
  ],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
  departmentId: [{ required: true, message: "请选择部门", trigger: "change" }],
  roleIds: [{ required: true, message: "请选择角色", trigger: "change" }]
};

// 密码修改相关
const passwordDialogVisible = ref(false);
const passwordFormRef = ref(null);
const passwordForm = ref({
  id: "",
  password: "",
  confirmPassword: ""
});

const passwordRules = {
  password: [{ required: true, message: "请输入新密码", trigger: "blur" }],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.password) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
};

// 批量设置部门相关
const batchDepartmentDialogVisible = ref(false);
const batchDepartmentFormRef = ref(null);
const batchDepartmentForm = ref({
  departmentId: "",
  departmentName: ""
});

const batchDepartmentRules = {
  departmentId: [{ required: true, message: "请选择部门", trigger: "change" }]
};

// 批量设置角色相关
const batchRoleDialogVisible = ref(false);
const batchRoleFormRef = ref(null);
const batchRoleForm = ref({
  roleIds: [],
  roleNames: []
});

const batchRoleRules = {
  roleIds: [{ required: true, message: "请选择角色", trigger: "change" }]
};

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true;
  try {
    const { data } = await getUserList();
    if (data) {
      userList.value = data;
    }
  } finally {
    loading.value = false;
  }
};

// 获取部门和角色选项
const fetchOptions = async () => {
  try {
    const [departmentRes, roleRes] = await Promise.all([
      getDepartmentList(),
      getRoleList()
    ]);
    departmentOptions.value = departmentRes || [];
    console.log(departmentRes)
    roleOptions.value = roleRes || [];
  } catch (error) {
    console.error("获取选项失败:", error);
  }
};

// 选择部门时同时保存部门名称
const handleDepartmentSelect = (data) => {
  formData.value.departmentName = data.name;
};

// 选择角色时同时保存角色名称
const handleRoleSelect = (values) => {
  formData.value.roleNames = roleOptions.value
    .filter((role) => values.includes(role.id))
    .map((role) => role.name);
};

// 表格多选变化
const handleSelectionChange = (selection) => {
  selectedUsers.value = selection;
};

// 添加用户
const handleAdd = () => {
  dialogType.value = "add";
  formData.value = {
    username: "",
    email: "",
    password: "",
    departmentId: "",
    departmentName: "",
    roleIds: [],
    roleNames: [],
    status: 1
  };
  dialogVisible.value = true;
};

// 编辑用户
const handleEdit = (row) => {
  dialogType.value = "edit";
  formData.value = { ...row };
  dialogVisible.value = true;
};

// 删除用户
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认删除用户"${row.username}"吗？`,
      "删除确认",
      {
        type: "warning"
      }
    );

    loading.value = true;
    if (await deleteUsers([row.id])) {
      await fetchUserList();
    }
  } finally {
    loading.value = false;
  }
};

// 批量删除用户
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确认删除选中的 ${selectedUsers.value.length} 个用户吗？`,
      "批量删除确认",
      {
        type: "warning"
      }
    );

    loading.value = true;
    if (await deleteUsers(selectedUsers.value.map((user) => user.id))) {
      await fetchUserList();
    }
  } finally {
    loading.value = false;
  }
};

// 修改密码
const handlePassword = (row) => {
  passwordForm.value = {
    id: row.id,
    password: "",
    confirmPassword: ""
  };
  passwordDialogVisible.value = true;
};

// 提交密码修改
const handlePasswordSubmit = async () => {
  if (!passwordFormRef.value) return;
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        if (await updatePassword(passwordForm.value.id, passwordForm.value.password)) {
          passwordDialogVisible.value = false;
        }
      } finally {
        loading.value = false;
      }
    }
  });
};

// 批量设置部门
const handleBatchDepartment = () => {
  batchDepartmentForm.value = {
    departmentId: "",
    departmentName: ""
  };
  batchDepartmentDialogVisible.value = true;
};

// 批量部门选择
const handleBatchDepartmentSelect = (data) => {
  batchDepartmentForm.value.departmentName = data.name;
};

// 提交批量部门设置
const handleBatchDepartmentSubmit = async () => {
  if (!batchDepartmentFormRef.value) return;
  await batchDepartmentFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const { departmentId, departmentName } = batchDepartmentForm.value;
        if (
          await batchUpdateDepartment(
            selectedUsers.value.map((user) => user.id),
            departmentId,
            departmentName
          )
        ) {
          batchDepartmentDialogVisible.value = false;
          await fetchUserList();
        }
      } finally {
        loading.value = false;
      }
    }
  });
};

// 批量设置角色
const handleBatchRole = () => {
  batchRoleForm.value = {
    roleIds: [],
    roleNames: []
  };
  batchRoleDialogVisible.value = true;
};

// 批量角色选择
const handleBatchRoleSelect = (values) => {
  batchRoleForm.value.roleNames = roleOptions.value
    .filter((role) => values.includes(role.id))
    .map((role) => role.name);
};

// 提交批量角色设置
const handleBatchRoleSubmit = async () => {
  if (!batchRoleFormRef.value) return;
  await batchRoleFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const { roleIds, roleNames } = batchRoleForm.value;
        if (
          await batchUpdateRole(
            selectedUsers.value.map((user) => user.id),
            roleIds,
            roleNames
          )
        ) {
          batchRoleDialogVisible.value = false;
          await fetchUserList();
        }
      } finally {
        loading.value = false;
      }
    }
  });
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const handler = dialogType.value === "add" ? addUser : updateUser;
        if (await handler(formData.value)) {
          dialogVisible.value = false;
          await fetchUserList();
        }
      } finally {
        loading.value = false;
      }
    }
  });
};

// 页面加载时获取数据
onMounted(() => {
  fetchUserList();
  fetchOptions();
});
</script>

<style scoped>
.user-container {
  height: calc(100vh - 170px);
  box-sizing: border-box;
}

.user-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color);
}

.header-left {
  display: flex;
  align-items: center;
}

.ml-4 {
  margin-left: 1rem;
}

.mr-1 {
  margin-right: 0.25rem;
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
