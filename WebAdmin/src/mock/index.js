import Mock from "mockjs";

// 设置拦截ajax请求的相应时间
Mock.setup({
  timeout: "200-600"
});

// 导入所有的 mock 文件
import "./sys/user.js";
import "./sys/department";
import "./sys/role";
import "./sys/usermanage";

export default Mock;
