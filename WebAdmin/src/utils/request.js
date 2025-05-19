import axios from "axios";
import { ElMessage } from "element-plus";
import { userStore } from "@/store/sys/user.js";

// 创建axios实例
const service = axios.create({
  baseURL: "http://localhost:9002", // API的base_url
  timeout: 60000, // 请求超时时间
  withCredentials: true, // 允许携带cookie
  headers: {
    "Content-Type": "application/json"
  }
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const user = userStore();
    if (user.isLogin) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 如果是401错误，清除登录状态
    if (error.response && error.response.status === 401) {
      const user = userStore();
      user.clearLoginState();
    }
    
    // 如果请求接口为/api/user/verify，不弹出错误信息
    if (error.response && error.response.config.url === "/api/user/verify") {
      return error.response;
    } else if (error.response && error.response.status === 401) {
      ElMessage.error("未授权，请登录");
    } else {
      ElMessage.error(error.message || "请求失败");
    }
    return Promise.reject(error);
  }
);

export default service;
