import { PrismaClient, User as PrismaUser } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import {
  User,
  UserRole,
  UpdateUserProfileRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  UserListQuery,
  UserListResponse,
  UserStats,
  DeleteUserRequest,
  UserWorkspaceInfo
} from '../types/user.js';
import { validatePassword } from '../utils/password.js';

export class UserService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  // 사용자 정보 조회
  async getUserById(userId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isEmailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) return null;

    return {
      ...user,
      role: user.role as UserRole
    };
  }

  // 이메일로 사용자 조회
  async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isEmailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) return null;

    return {
      ...user,
      role: user.role as UserRole
    };
  }

  // 사용자 목록 조회 (관리자용)
  async getUsers(query: UserListQuery): Promise<UserListResponse> {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          isEmailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      this.prisma.user.count({ where })
    ]);

    return {
      users: users.map(user => ({
        ...user,
        role: user.role as UserRole
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // 사용자 프로필 업데이트
  async updateUserProfile(userId: string, data: UpdateUserProfileRequest): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isEmailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return {
      ...updatedUser,
      role: updatedUser.role as UserRole
    };
  }

  // 사용자 정보 업데이트 (관리자용)
  async updateUser(userId: string, data: UpdateUserRequest): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isEmailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return {
      ...updatedUser,
      role: updatedUser.role as UserRole
    };
  }

  // 비밀번호 변경
  async changePassword(userId: string, data: ChangePasswordRequest): Promise<void> {
    // 현재 비밀번호 확인
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    });

    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('현재 비밀번호가 올바르지 않습니다.');
    }

    // 새 비밀번호 검증
    const passwordValidation = validatePassword(data.newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(`비밀번호가 요구사항을 만족하지 않습니다: ${passwordValidation.errors.join(', ')}`);
    }

    // 새 비밀번호 해싱 및 저장
    const hashedNewPassword = await bcrypt.hash(data.newPassword, 12);
    
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    });
  }

  // 사용자 통계 조회 (관리자용)
  async getUserStats(): Promise<UserStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      usersByRole
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          lastLoginAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true
      })
    ]);

    const roleStats = usersByRole.reduce((acc, item) => {
      acc[item.role as UserRole] = item._count;
      return acc;
    }, {} as Record<UserRole, number>);

    // 모든 역할에 대해 0으로 초기화
    Object.values(UserRole).forEach(role => {
      if (!(role in roleStats)) {
        roleStats[role] = 0;
      }
    });

    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      usersByRole: roleStats
    };
  }

  // 사용자 삭제
  async deleteUser(userId: string, options: DeleteUserRequest = {}): Promise<void> {
    const { transferWorkflowsTo, deleteWorkflows = false } = options;

    await this.prisma.$transaction(async (tx) => {
      // 워크플로우 처리
      if (transferWorkflowsTo) {
        // 워크플로우를 다른 사용자에게 이전
        await tx.workflow.updateMany({
          where: { createdById: userId },
          data: { createdById: transferWorkflowsTo }
        });
      } else if (deleteWorkflows) {
        // 워크플로우 삭제
        await tx.workflow.deleteMany({
          where: { createdById: userId }
        });
      } else {
        // 워크플로우가 있으면 삭제 불가
        const workflowCount = await tx.workflow.count({
          where: { createdById: userId }
        });
        
        if (workflowCount > 0) {
          throw new Error('사용자가 생성한 워크플로우가 있습니다. 워크플로우를 먼저 처리해주세요.');
        }
      }

      // 워크스페이스 멤버십 삭제
      await tx.workspaceUser.deleteMany({
        where: { userId }
      });

      // API 키 삭제
      await tx.apiKey.deleteMany({
        where: { userId }
      });

      // 사용자 삭제
      await tx.user.delete({
        where: { id: userId }
      });
    });
  }

  // 사용자 워크스페이스 정보 조회
  async getUserWorkspaces(userId: string): Promise<UserWorkspaceInfo[]> {
    const workspaceUsers = await this.prisma.workspaceUser.findMany({
      where: { userId },
      include: {
        workspace: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return workspaceUsers.map(wu => ({
      workspaceId: wu.workspace.id,
      workspaceName: wu.workspace.name,
      role: wu.role,
      joinedAt: wu.createdAt
    }));
  }

  // 이메일 인증 상태 업데이트
  async verifyEmail(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isEmailVerified: true,
        updatedAt: new Date()
      }
    });
  }

  // 마지막 로그인 시간 업데이트
  async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date()
      }
    });
  }

  // 사용자 존재 여부 확인
  async userExists(userId: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { id: userId }
    });
    return count > 0;
  }

  // 관리자 권한 확인
  async isAdmin(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    return user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
  }

  // 슈퍼 관리자 권한 확인
  async isSuperAdmin(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    return user?.role === UserRole.SUPER_ADMIN;
  }
} 