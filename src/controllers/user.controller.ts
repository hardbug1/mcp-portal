import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';
import {
  UpdateUserProfileRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  UserListQuery,
  DeleteUserRequest,
  UserRole
} from '../types/user.js';
import { AuthenticatedRequest } from '../types/express.js';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // 현재 사용자 프로필 조회
  getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const user = await this.userService.getUserById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: '사용자를 찾을 수 없습니다.'
        });
        return;
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('프로필 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '프로필 조회 중 오류가 발생했습니다.'
      });
    }
  };

  // 사용자 프로필 업데이트
  updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const updateData: UpdateUserProfileRequest = req.body;

      const updatedUser = await this.userService.updateUserProfile(userId, updateData);

      res.json({
        success: true,
        message: '프로필이 성공적으로 업데이트되었습니다.',
        data: { user: updatedUser }
      });
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      res.status(500).json({
        success: false,
        message: '프로필 업데이트 중 오류가 발생했습니다.'
      });
    }
  };

  // 비밀번호 변경
  changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const passwordData: ChangePasswordRequest = req.body;

      await this.userService.changePassword(userId, passwordData);

      res.json({
        success: true,
        message: '비밀번호가 성공적으로 변경되었습니다.'
      });
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: '비밀번호 변경 중 오류가 발생했습니다.'
        });
      }
    }
  };

  // 사용자 워크스페이스 목록 조회
  getUserWorkspaces = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const workspaces = await this.userService.getUserWorkspaces(userId);

      res.json({
        success: true,
        data: { workspaces }
      });
    } catch (error) {
      console.error('워크스페이스 목록 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '워크스페이스 목록 조회 중 오류가 발생했습니다.'
      });
    }
  };

  // === 관리자 전용 API ===

  // 사용자 목록 조회 (관리자)
  getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // 관리자 권한 확인
      const isAdmin = await this.userService.isAdmin(req.user!.id);
      if (!isAdmin) {
        res.status(403).json({
          success: false,
          message: '관리자 권한이 필요합니다.'
        });
        return;
      }

      const query: UserListQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        search: req.query.search as string,
        role: req.query.role as UserRole,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'desc'
      };

      const result = await this.userService.getUsers(query);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('사용자 목록 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '사용자 목록 조회 중 오류가 발생했습니다.'
      });
    }
  };

  // 특정 사용자 조회 (관리자)
  getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // 관리자 권한 확인
      const isAdmin = await this.userService.isAdmin(req.user!.id);
      if (!isAdmin) {
        res.status(403).json({
          success: false,
          message: '관리자 권한이 필요합니다.'
        });
        return;
      }

      const { userId } = req.params;
      const user = await this.userService.getUserById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: '사용자를 찾을 수 없습니다.'
        });
        return;
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('사용자 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '사용자 조회 중 오류가 발생했습니다.'
      });
    }
  };

  // 사용자 정보 업데이트 (관리자)
  updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // 관리자 권한 확인
      const isAdmin = await this.userService.isAdmin(req.user!.id);
      if (!isAdmin) {
        res.status(403).json({
          success: false,
          message: '관리자 권한이 필요합니다.'
        });
        return;
      }

      const { userId } = req.params;
      const updateData: UpdateUserRequest = req.body;

      // 슈퍼 관리자 역할 변경은 슈퍼 관리자만 가능
      if (updateData.role === UserRole.SUPER_ADMIN) {
        const isSuperAdmin = await this.userService.isSuperAdmin(req.user!.id);
        if (!isSuperAdmin) {
          res.status(403).json({
            success: false,
            message: '슈퍼 관리자 권한이 필요합니다.'
          });
          return;
        }
      }

      const updatedUser = await this.userService.updateUser(userId, updateData);

      res.json({
        success: true,
        message: '사용자 정보가 성공적으로 업데이트되었습니다.',
        data: { user: updatedUser }
      });
    } catch (error) {
      console.error('사용자 정보 업데이트 오류:', error);
      res.status(500).json({
        success: false,
        message: '사용자 정보 업데이트 중 오류가 발생했습니다.'
      });
    }
  };

  // 사용자 삭제 (관리자)
  deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // 관리자 권한 확인
      const isAdmin = await this.userService.isAdmin(req.user!.id);
      if (!isAdmin) {
        res.status(403).json({
          success: false,
          message: '관리자 권한이 필요합니다.'
        });
        return;
      }

      const { userId } = req.params;
      const deleteOptions: DeleteUserRequest = req.body;

      // 자기 자신 삭제 방지
      if (userId === req.user!.id) {
        res.status(400).json({
          success: false,
          message: '자기 자신을 삭제할 수 없습니다.'
        });
        return;
      }

      // 슈퍼 관리자 삭제는 슈퍼 관리자만 가능
      const targetUser = await this.userService.getUserById(userId);
      if (targetUser?.role === UserRole.SUPER_ADMIN) {
        const isSuperAdmin = await this.userService.isSuperAdmin(req.user!.id);
        if (!isSuperAdmin) {
          res.status(403).json({
            success: false,
            message: '슈퍼 관리자는 슈퍼 관리자만 삭제할 수 있습니다.'
          });
          return;
        }
      }

      await this.userService.deleteUser(userId, deleteOptions);

      res.json({
        success: true,
        message: '사용자가 성공적으로 삭제되었습니다.'
      });
    } catch (error) {
      console.error('사용자 삭제 오류:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: '사용자 삭제 중 오류가 발생했습니다.'
        });
      }
    }
  };

  // 사용자 통계 조회 (관리자)
  getUserStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // 관리자 권한 확인
      const isAdmin = await this.userService.isAdmin(req.user!.id);
      if (!isAdmin) {
        res.status(403).json({
          success: false,
          message: '관리자 권한이 필요합니다.'
        });
        return;
      }

      const stats = await this.userService.getUserStats();

      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      console.error('사용자 통계 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '사용자 통계 조회 중 오류가 발생했습니다.'
      });
    }
  };

  // 이메일 인증 (관리자)
  verifyUserEmail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // 관리자 권한 확인
      const isAdmin = await this.userService.isAdmin(req.user!.id);
      if (!isAdmin) {
        res.status(403).json({
          success: false,
          message: '관리자 권한이 필요합니다.'
        });
        return;
      }

      const { userId } = req.params;
      await this.userService.verifyEmail(userId);

      res.json({
        success: true,
        message: '사용자 이메일이 인증되었습니다.'
      });
    } catch (error) {
      console.error('이메일 인증 오류:', error);
      res.status(500).json({
        success: false,
        message: '이메일 인증 중 오류가 발생했습니다.'
      });
    }
  };
} 