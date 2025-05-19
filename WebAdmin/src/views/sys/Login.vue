<!--suppress JSUnresolvedReference -->
<script setup>
import { Login, Register } from "@/apis/sys/user.js";
import ThemeOption from "@/components/framework/theme-option.vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { userStore } from "@/store/sys/user.js";

const user = userStore();
const router = useRouter();
const loginLoad = ref(false);
const appEnv = import.meta.env;
const loginFormRef = ref(null); // 添加表单引用
const registerFormRef = ref(null); // 添加表单引用
const loginInfo = ref({
  Email: "admin@qq.com",
  Password: "123456"
});
const registerInfo = ref({
  Email: "",
  UserName: "",
  Password: "",
  confirm: ""
});
const viewStatus = ref("login");

// 表单验证规则
const rules = {
  loginRules: {
    Email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    Password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
    ]
  },
  registerRules: {
    Email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    UserName: [
      { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    Password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
    ],
    confirm: [
      { required: true, message: '请确认密码', trigger: 'blur' },
      {
        validator: (_rule, value, callback) => {
          if (value !== registerInfo.value.Password) {
            callback(new Error('两次输入的密码不一致'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
  }
}

// 处理登录
const handleLogin = async (formEl) => {
  if (!formEl) return;
  await formEl.validate(async (valid) => {
    if (valid) {
      loginLoad.value = true;
      try {
        const response = await Login(loginInfo.value);
        if (response.code === 200) {
          // 登录成功，储存用户信息
          user.userInfo = response.data;
          user.isLogin = true;

          // 跳转到首页
          router.push('/home');
        }
      } catch (error) {
        // 处理登录错误
        user.userInfo = {};
        user.isLogin = false;
      } finally {
        loginLoad.value = false;
      }
    }
  });
};

// 处理注册
const handleRegister = async (formEl) => {
  if (!formEl) return;
  await formEl.validate(async (valid) => {
    if (valid) {
      loginLoad.value = true;
      try {
        const response = await Register(registerInfo.value);
        if (response.code === 200) {
          viewStatus.value = 'login';
        }
      } finally {
        loginLoad.value = false;
      }
    }
  });
};
</script>

<template>
  <el-container class="mainView" v-loading="loginLoad">
    <span class="loginTitle">{{ appEnv.VITE_APP_TITLE }}</span>

    <!-- 登录页面 -->
    <div class="boxView" v-if="viewStatus === 'login'">
      <span class="boxTitle">Login</span>

      <!-- 表单默认提交时触发 handleLogin -->
      <el-form
        ref="loginFormRef"
        :model="loginInfo"
        :rules="rules.loginRules"
        style="margin-top: 32px"
        label-position="left"
        label-width="48px"
        size="large"
      >
        <el-form-item label="邮箱" prop="Email" class="form-item">
          <el-input v-model="loginInfo.Email" placeholder="Email" />
        </el-form-item>
        <el-form-item label="密码" prop="Password" class="form-item">
          <el-input
            v-model="loginInfo.Password"
            placeholder="Password"
            show-password
            @keyup.enter="handleLogin(loginFormRef)"
          />
        </el-form-item>
        <el-form-item style="padding-left: 39px; margin-top: 32px">
          <el-button 
            type="primary" 
            size="large" 
            :loading="loginLoad"
            @click.prevent="handleLogin(loginFormRef)"
          >
            Login
          </el-button>
        </el-form-item>
      </el-form>

      <el-footer class="boxFooter">
        <div style="width: 50%; justify-content: center">
          <themeOption tipPlacement="top" />
        </div>
        <div
          style="
            width: 50%;
            display: flex;
            flex-direction: row;
            justify-content: flex-end;
          "
        >
          <el-tooltip content="注册" placement="top">
            <el-button
              link
              type="primary"
              size="large"
              style="font-size: 1rem"
              @click="viewStatus = 'reg'"
              >Register</el-button
            >
          </el-tooltip>
        </div>
      </el-footer>
    </div>

    <!-- 注册页面 -->
    <div class="boxView" v-else>
      <span class="boxTitle">Register</span>

      <!-- 表单默认提交时触发 handleRegister -->
      <el-form
        ref="registerFormRef"
        :model="registerInfo"
        :rules="rules.registerRules"
        style="margin-top: 16px"
        label-position="right"
        label-width="72px"
        size="large"
        @submit.prevent="handleRegister(registerFormRef)"
      >
        <el-form-item label="邮箱" prop="Email" class="form-item">
          <el-input
            v-model="registerInfo.Email"
            placeholder="Email"
          ></el-input>
        </el-form-item>
        <el-form-item label="用户名" prop="UserName" class="form-item">
          <el-input
            v-model="registerInfo.UserName"
            placeholder="Username"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="Password" class="form-item">
          <el-input
            v-model="registerInfo.Password"
            placeholder="Password"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirm" class="form-item">
          <el-input
            v-model="registerInfo.confirm"
            placeholder="ConfirmPassword"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item style="padding-left: 18px; margin-top: 32px">
          <el-button type="primary" size="large" native-type="submit"
            >Register</el-button
          >
        </el-form-item>
      </el-form>

      <el-footer class="boxFooter">
        <div style="width: 50%; justify-content: center">
          <themeOption tipPlacement="top" />
        </div>
        <div
          style="
            width: 50%;
            display: flex;
            flex-direction: row;
            justify-content: flex-end;
          "
        >
          <el-tooltip content="登录" placement="top">
            <el-button
              link
              type="primary"
              size="large"
              style="font-size: 1rem"
              @click="viewStatus = 'login'"
              >Login</el-button
            >
          </el-tooltip>
        </div>
      </el-footer>
    </div>
  </el-container>
</template>

<style scoped>
.mainView {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
}
.boxView {
  width: 512px;
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  padding: 32px;
}
.loginTitle,
.boxTitle {
  font-family: "TypoGraphica", "argon", "Arial Narrow", serif;
  font-size: 3em;
  letter-spacing: 2px;
  background: linear-gradient(
    120deg,
    grey,
    cornflowerblue,
    coral,
    darkgoldenrod
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  margin-bottom: 20px;
}

.boxFooter {
  display: flex;
  flex-direction: row;
  width: 100%;
  padding: 10px;
  font-size: 12px;
  margin-top: auto;
}

:deep(.form-item .el-form-item__label) {
  white-space: nowrap;
  height: 32px;
  line-height: 32px;
}
</style>
