<template>
  <div class="user-container">
    <div class="user-content">
      <!-- 个人信息卡片 -->
      <el-card class="profile-card">
        <div class="profile-header">
          <div class="avatar-container">
            <AvatarCropper
              v-model="userInfo.avatar"
              :username="userInfo.username"
              :upload-function="customUploadAvatar"
              @success="handleAvatarSuccess"
            />
          </div>
          <h2>{{ userInfo.username }}</h2>
          <p class="role-text">
            {{ userInfo.department }} | {{ userInfo.role }}
          </p>
        </div>
        <el-divider />
        <div class="profile-info">
          <p>
            <el-icon><Message /></el-icon> 邮箱：{{ userInfo.email }}
          </p>
          <div class="time-info">
            <p>
              <el-icon><Clock /></el-icon> 注册时间：{{ userInfo.createTime }}
            </p>
            <p>
              <el-icon><Timer /></el-icon> 最后登录：{{
                userInfo.lastLoginTime
              }}
            </p>
          </div>
        </div>
      </el-card>

      <div class="form-container">
        <!-- 基本信息卡片 -->
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
              <el-button type="primary" size="small" @click="handleSaveInfo"
                >保存更改</el-button
              >
            </div>
          </template>
          <el-form
            ref="userFormRef"
            :model="userForm"
            :rules="rules"
            label-width="80px"
            class="user-form"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="userForm.username" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="userForm.email" />
            </el-form-item>
            <!-- <el-form-item label="部门">
              <el-input v-model="userForm.department" disabled />
            </el-form-item>
            <el-form-item label="角色">
              <el-input v-model="userForm.role" disabled />
            </el-form-item> -->
            <el-form-item label="个人简介">
              <el-input
                v-model="userForm.bio"
                type="textarea"
                :rows="3"
                placeholder="这个人很懒，什么都没有留下..."
              />
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 修改密码卡片 -->
        <el-card class="password-card">
          <template #header>
            <div class="card-header">
              <span>修改密码</span>
              <el-button
                type="primary"
                size="small"
                @click="handleChangePassword"
                >确认修改</el-button
              >
            </div>
          </template>
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
            class="password-form"
          >
            <el-form-item label="当前密码" prop="currentPassword">
              <el-input
                v-model="passwordForm.currentPassword"
                type="password"
                show-password
                placeholder="请输入当前密码"
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                show-password
                placeholder="请输入新密码"
              />
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                show-password
                placeholder="请再次输入新密码"
              />
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  handleAvatarUpload,
  handlePasswordUpdate,
  handleUserInfoUpdate
} from "@/apis/sys/user";
import AvatarCropper from "@/components/framework/avatarCropper.vue";
import { userStore } from "@/store/sys/user";
import { reactive, ref } from "vue";

const user = userStore();
const loading = ref(false);

// 用户信息
const userInfo = reactive({
  username: user.userInfo.username || "",
  email: user.userInfo.email || "",
  department: user.userInfo.department || "",
  role: user.userInfo.roles?.[0] || "",
  avatar: user.userInfo.avatar || "",
  createTime: user.userInfo.createTime || "",
  lastLoginTime: user.userInfo.lastLoginTime || "",
  bio: user.userInfo.bio || ""
});

// 用户表单数据
const userForm = reactive({
  username: userInfo.username,
  email: userInfo.email,
  department: userInfo.department,
  role: userInfo.role,
  bio: userInfo.bio
});

// 密码表单数据
const passwordFormRef = ref(null);
const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
});

// 表单验证规则
const rules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }
  ],
  email: [
    { required: true, message: "请输入邮箱地址", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" }
  ]
};

const userFormRef = ref(null);

// 密码验证规则
const passwordRules = {
  currentPassword: [
    { required: true, message: "请输入当前密码", trigger: "blur" }
  ],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "密码长度不能小于6位", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    {
      validator: (_rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
};

// 自定义头像上传函数
const customUploadAvatar = async (base64Data) => {
  const res = await handleAvatarUpload(base64Data);
  return res;
};

// 保存基本信息
const handleSaveInfo = async () => {
  if (!userFormRef.value) return;

  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        if (
          await handleUserInfoUpdate({
            username: userForm.username,
            email: userForm.email,
            bio: userForm.bio
          })
        ) {
          // 更新本地显示的信息
          Object.assign(userInfo, {
            username: userForm.username,
            email: userForm.email,
            bio: userForm.bio
          });
        }
      } finally {
        loading.value = false;
      }
    }
  });
};

// 处理头像上传成功
const handleAvatarSuccess = (res) => {
  userInfo.avatar = res.data.url;
};

// 修改密码
const handleChangePassword = () => {
  passwordFormRef.value?.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        if (await handlePasswordUpdate(passwordForm)) {
          // 清空表单
          passwordForm.currentPassword = "";
          passwordForm.newPassword = "";
          passwordForm.confirmPassword = "";
          passwordFormRef.value.resetFields();
        }
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style scoped>
.user-container {
  padding: 20px;
}

.user-content {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 20px;
}

.profile-card {
  margin-top: 64px;
  height: fit-content;
}

.profile-header {
  text-align: center;
  padding: 20px 0;
}

.profile-header h2 {
  margin: 10px 0 5px;
  font-size: 20px;
}

.role-text {
  color: var(--el-text-color-secondary);
  margin: 0;
}

.profile-info {
  padding: 0 20px;
}

.profile-info p {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0;
  color: var(--el-text-color-regular);
  white-space: nowrap;
  font-size: 14px;
}

.time-info {
  margin-top: 15px;
}

.time-info p {
  font-size: 14px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 8px;
  padding: 0 15px !important;
}

.user-form,
.password-form {
  max-width: 384px;
  margin: 15px auto;
}

:deep(.el-form-item__content) {
  justify-content: flex-start;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

:deep(.el-card__body) {
  padding: 15px;
}

:deep(.el-avatar) {
  font-size: 32px; /* 增大字体大小 */
  font-weight: bold; /* 加粗显示 */
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.avatar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
</style>
