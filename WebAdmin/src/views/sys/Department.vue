<template>
  <div class="department-container">
    <el-card class="department-card">
      <template #header>
        <div class="department-header">
          <div class="header-left">
            <span class="title">部门列表</span>
            <el-tooltip
              :content="isAllExpanded ? '收起全部' : '展开全部'"
              placement="top"
            >
              <el-button
                class="expand-btn"
                :icon="isAllExpanded ? ArrowUp : ArrowDown"
                circle
                size="small"
                :type="isDark ? 'info' : 'primary'"
                @click="toggleExpandAll"
              />
            </el-tooltip>
          </div>
          <el-button type="primary" @click="handleAdd">添加部门</el-button>
        </div>
      </template>
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="departmentList"
        row-key="id"
        border
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="name" label="部门名称" />
        <el-table-column prop="description" label="部门描述" />
        <el-table-column label="操作" width="220">
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
              <el-tooltip content="展开/收起" placement="top" :disabled="!hasChildren(row)">
                <el-button
                  type="info"
                  :icon="isExpanded(row) ? ArrowUp : ArrowDown"
                  circle
                  size="small"
                  :disabled="!hasChildren(row)"
                  @click="toggleChildren(row)"
                />
              </el-tooltip>
            </el-button-group>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无部门数据" />
        </template>
      </el-table>
    </el-card>

    <!-- 部门表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加部门' : '编辑部门'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="上级部门" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :data="departmentList"
            :props="{ label: 'name', value: 'id' }"
            placeholder="请选择上级部门"
            check-strictly
            filterable
            default-expand-all
          />
        </el-form-item>
        <el-form-item label="部门描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入部门描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  addDepartment,
  deleteDepartment,
  getDepartmentList,
  updateDepartment
} from "@/apis/sys/department";
import { Delete, Edit, ArrowDown, ArrowUp } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";
import { onMounted, ref } from "vue";
import { useDark } from "@vueuse/core";

// 部门列表数据
const departmentList = ref([]);

// 加载状态
const loading = ref(false);

// 表格引用
const tableRef = ref(null);

// 是否全部展开
const isAllExpanded = ref(true);

// 展开的行的ID集合
const expandedRows = ref(new Set());

// 是否暗色主题
const isDark = useDark();

// 判断是否有子节点
const hasChildren = (row) => {
  return row.children && row.children.length > 0;
};

// 判断节点是否展开
const isExpanded = (row) => {
  return expandedRows.value.has(row.id);
};

// 递归展开/收起所有节点
const setExpandAll = (rows, expanded) => {
  if (!tableRef.value || !rows) return;
  
  rows.forEach(row => {
    tableRef.value.toggleRowExpansion(row, expanded);
    if (expanded) {
      expandedRows.value.add(row.id);
    } else {
      expandedRows.value.delete(row.id);
    }
    if (row.children) {
      setExpandAll(row.children, expanded);
    }
  });
};

// 切换全部展开/收起
const toggleExpandAll = () => {
  isAllExpanded.value = !isAllExpanded.value;
  setExpandAll(departmentList.value, isAllExpanded.value);
};

// 切换指定节点的展开/收起
const toggleChildren = (row) => {
  if (!tableRef.value || !row.children) return;
  
  const expanded = !isExpanded(row);
  setExpandAll([row], expanded);
};

// 获取部门列表
const fetchDepartmentList = async () => {
  loading.value = true;
  try {
    const data = await getDepartmentList();
    if (data) {
      departmentList.value = data;
      // 初始化展开状态
      setExpandAll(departmentList.value, true);
    }
  } catch (error) {
    console.error("获取部门列表失败:", error);
  } finally {
    loading.value = false;
  }
};

// 添加部门
const handleAdd = () => {
  dialogType.value = "add";
  formData.value = {
    name: "",
    parentId: "0",
    description: ""
  };
  dialogVisible.value = true;
};

// 编辑部门
const handleEdit = (row) => {
  dialogType.value = "edit";
  formData.value = { ...row };
  dialogVisible.value = true;
};

// 删除部门
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm("确定要删除该部门吗？删除后无法恢复！", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    loading.value = true;
    if (await deleteDepartment(row.id)) {
      await fetchDepartmentList();
    }
  } finally {
    loading.value = false;
  }
};

// 表单相关
const dialogVisible = ref(false);
const dialogType = ref("add"); // add 或 edit
const formRef = ref(null);
const formData = ref({
  name: "",
  parentId: "0",
  description: ""
});

// 表单验证规则
const rules = {
  name: [
    { required: true, message: "请输入部门名称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }
  ],
  parentId: [{ required: true, message: "请选择上级部门", trigger: "change" }],
  description: [{ max: 200, message: "描述不能超过200个字符", trigger: "blur" }]
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const handler =
          dialogType.value === "add" ? addDepartment : updateDepartment;
        if (await handler(formData.value)) {
          dialogVisible.value = false;
          await fetchDepartmentList();
        }
      } finally {
        loading.value = false;
      }
    }
  });
};

// 生命周期钩子
onMounted(async () => {
  await fetchDepartmentList();
});
</script>

<style scoped>
.department-container {
  height: calc(100vh - 170px);
  box-sizing: border-box;
}

.department-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.department-header {
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
  gap: 16px;
}

.title {
  font-size: 16px;
  font-weight: 500;
}

.expand-btn {
  margin-left: 8px;
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

:deep(.el-button-group .el-button--small) {
  padding: 5px;
}

:deep(.el-button-group .el-button+.el-button) {
  margin-left: -1px;
}
</style>
