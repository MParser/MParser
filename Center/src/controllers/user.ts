/**
 * 用户相关控制器
 */
import { Request, Response } from 'express';
import logger from '../utils/logger';

// 模拟用户数据
const mockUserInfo = {
  id: 1,
  email: "admin@qq.com",
  username: "Admin",
  departmentId: 1,
  department: "技术部",
  roleIds: [1],
  roles: ["管理员"],
  avatar: "",
  createTime: "2024-01-15 12:00:00",
  lastLoginTime: "2024-01-15 23:59:59"
};

export class UserController {
  /**
   * 用户注册
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { Email, UserName, Password } = req.body;
      // 这里模拟注册成功，不实际操作数据库
      res.success({}, '注册成功');
    } catch (error: any) {
      logger.error('注册失败:', error);
      res.internalError('注册失败');
    }
  }

  /**
   * 用户登录
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { Email, Password } = req.body;

      if (Email === "admin@qq.com" && Password === "123456") {
        // 更新最后登录时间
        const updatedUserInfo = {
          ...mockUserInfo,
          lastLoginTime: new Date().toLocaleString()
        };

        res.success(updatedUserInfo, '登录成功');
      } else {
        res.unauthorized('邮箱或密码错误');
      }
    } catch (error: any) {
      logger.error('登录失败:', error);
      res.internalError('登录失败');
    }
  }

  /**
   * 验证登录状态
   */
  static async verify(req: Request, res: Response): Promise<void> {
    try {
      // 这里简单返回模拟数据，实际应检查会话或令牌
      res.success(mockUserInfo, '验证成功');
    } catch (error: any) {
      logger.error('验证登录状态失败:', error);
      res.internalError('验证登录状态失败');
    }
  }

  /**
   * 用户登出
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // 实际实现中应清理会话数据
      res.success({}, '注销成功');
    } catch (error: any) {
      logger.error('注销失败:', error);
      res.internalError('注销失败');
    }
  }

  /**
   * 获取系统公告
   */
  static async getAnnouncements(req: Request, res: Response): Promise<void> {
    try {
      const announcements = [
        {
          id: 3,
          title: "系统更新通知",
          content: "系统将于本周五进行例行维护和功能更新，请提前做好相关工作安排。",
          date: "2025-01-15",
          type: "warning" // primary / success / warning / danger / info
        },
        {
          id: 2,
          title: "新功能上线公告",
          content: "系统新增数据导出功能，支持多种格式导出，欢迎试用并提供反馈。",
          date: "2025-01-10",
          type: "success"
        },
        {
          id: 1,
          title: "操作指南更新",
          content: "系统操作手册已更新，请在帮助中心查看最新版本。",
          date: "2025-01-05",
          type: "info"
        }
      ];
      
      res.success(announcements, '获取系统公告成功');
    } catch (error: any) {
      logger.error('获取系统公告失败:', error);
      res.internalError('获取系统公告失败');
    }
  }

  /**
   * 修改个人信息
   */
  static async updateUserInfo(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, bio } = req.body;
      res.success({ username, email, bio }, '个人信息修改成功');
    } catch (error: any) {
      logger.error('修改个人信息失败:', error);
      res.internalError('修改个人信息失败');
    }
  }

  /**
   * 修改密码
   */
  static async updatePassword(req: Request, res: Response): Promise<void> {
    try {
      const { oldPassword, newPassword } = req.body;
      
      // 简单的密码验证逻辑
      if (oldPassword === "123456") {
        res.success({}, '密码修改成功');
      } else {
        res.badRequest('原密码错误');
      }
    } catch (error: any) {
      logger.error('修改密码失败:', error);
      res.internalError('修改密码失败');
    }
  }

  /**
   * 上传头像
   */
  static async uploadAvatar(req: Request, res: Response): Promise<void> {
    try {
      const { avatar } = req.body;
      // 模拟返回一个头像URL
      const avatarUrl = "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg";
      
      res.success({ url: avatarUrl }, '头像上传成功');
    } catch (error: any) {
      logger.error('上传头像失败:', error);
      res.internalError('上传头像失败');
    }
  }
}