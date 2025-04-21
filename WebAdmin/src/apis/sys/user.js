import { tabStore } from "@/store/sys/tabs.js";
import { userStore } from "@/store/sys/user.js";
import request from "@/utils/request";
import { ElMessage } from "element-plus";

// 统一的错误处理函数
const handleApiError = (error, defaultMessage) => {
  console.error(defaultMessage, error);
  ElMessage.error(error.message || defaultMessage);
  return false;
};

// 用户登录
export async function Login(data) {
  try {
    const response = await request({
      url: "/api/user/login",
      method: "post",
      data
    });

    const user = userStore();
    if (response.code === 200) {
      // 确保用户信息格式一致
      const userInfo = response.data;
      user.setLoginState(userInfo);
      ElMessage.success(response.message || "登录成功");
    } else {
      user.clearLoginState();
      ElMessage.error(response.message || "登录失败");
    }
    tabStore().clean();
    return response;
  } catch (error) {
    console.error("登录失败:", error);
    return {
      code: 500,
      message: error.message || "登录失败"
    };
  }
}

// 验证登录状态
export async function VerifyLogin() {
  try {
    const response = await request({
      url: "/api/user/verify",
      method: "get"
    });

    const user = userStore();
    if (response.code === 200) {
      // 确保用户信息格式一致
      const userInfo = response.data;
      user.setLoginState(userInfo);
    } else {
      user.clearLoginState();
    }
    return response;
  } catch (error) {
    console.error("验证登录状态失败:", error);
    const user = userStore();
    user.clearLoginState();
    return {
      code: 500,
      message: error.message || "验证登录状态失败"
    };
  }
}

// 用户注册
export async function Register(data) {
  try {
    const response = await request({
      url: "/api/user/register",
      method: "post",
      data
    });
    if (response.code === 200) {
      ElMessage.success(response.message || "注册成功");
    } else {
      ElMessage.error(response.message || "注册失败");
    }
    return response;
  } catch (error) {
    console.error("注册失败:", error);
    return {
      code: 500,
      message: error.message || "注册请求失败"
    };
  }
}

// 用户登出
export async function Logout() {
  try {
    const response = await request({ url: "/api/user/logout", method: "post" });
    if (response.code === 200) {
      const user = userStore();
      user.clearLoginState();
      ElMessage.success(response.message || "注销成功");
    } else {
      ElMessage.error(response.message || "注销失败");
    }
    return response;
  } catch (error) {
    ElMessage.error(error.message || "注销失败");
    return {
      code: 500,
      message: error.message || "注销请求失败"
    };
  }
}

// 获取系统公告列表
export const getAnnouncements = async () => {
  try {
    const res = await request({
      url: "/api/sys/announcements",
      method: "get"
    });
    if (res.code === 200) {
      return {
        success: true,
        data: res.data
      };
    }
    ElMessage.error(res.message || "获取系统公告失败");
    return {
      success: false,
      data: null
    };
  } catch (error) {
    ElMessage.error(error.message || "获取系统公告失败");
    return {
      success: false,
      data: null
    };
  }
};

/**
 * 处理用户信息更新
 * @param {Object} data - 用户信息数据
 * @param {string} data.username - 用户名
 * @param {string} data.email - 邮箱
 * @param {string} data.bio - 个人简介
 * @returns {Promise<boolean>} 更新是否成功
 */
export const handleUserInfoUpdate = async (data) => {
  try {
    const res = await request({
      url: "/api/sys/user/info",
      method: "put",
      data
    });

    if (res.code === 200) {
      ElMessage.success("个人信息修改成功");
      // 更新store中的用户信息
      await VerifyLogin();
      return true;
    }
    throw new Error(res.message || "修改个人信息失败");
  } catch (error) {
    return handleApiError(error, "修改个人信息失败");
  }
};

/**
 * 处理密码修改
 * @param {Object} data - 密码数据
 * @param {string} data.currentPassword - 当前密码
 * @param {string} data.newPassword - 新密码
 * @returns {Promise<boolean>} 修改是否成功
 */
export const handlePasswordUpdate = async (data) => {
  try {
    const res = await request({
      url: "/api/sys/user/password",
      method: "put",
      data: {
        oldPassword: data.currentPassword,
        newPassword: data.newPassword
      }
    });

    if (res.code === 200) {
      ElMessage.success("密码修改成功");
      return true;
    }
    throw new Error(res.message || "修改密码失败");
  } catch (error) {
    return handleApiError(error, "修改密码失败");
  }
};

/**
 * 处理头像上传
 * @param {string} data - Base64格式的头像数据
 * @returns {Promise<Object>} 上传结果，包含头像URL
 * @throws {Error} 上传失败时抛出错误
 */
export const handleAvatarUpload = async (data) => {
  try {
    const res = await request({
      url: "/api/sys/user/avatar",
      method: "post",
      data: { avatar: data }
    });

    if (res.code === 200) {
      ElMessage.success("头像上传成功");
      // 更新store中的用户信息
      await VerifyLogin();
      return res;
    }
    throw new Error(res.message || "头像上传失败");
  } catch (error) {
    return handleApiError(error, "头像上传失败");
  }
};
