import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/user';

// 역할 계층 구조 정의
const roleHierarchy: Record<UserRole, UserRole[]> = {
  [UserRole.SUPER_ADMIN]: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER],
  [UserRole.ADMIN]: [UserRole.ADMIN, UserRole.USER],
  [UserRole.USER]: [UserRole.USER],
};

// 권한 정의
export const permissions = {
  // 사용자 관리
  USER_READ: 'user:read',
  USER_WRITE: 'user:write',
  USER_DELETE: 'user:delete',
  USER_ADMIN: 'user:admin',

  // 워크플로우 관리
  WORKFLOW_READ: 'workflow:read',
  WORKFLOW_WRITE: 'workflow:write',
  WORKFLOW_DELETE: 'workflow:delete',
  WORKFLOW_EXECUTE: 'workflow:execute',

  // 자격증명 관리
  CREDENTIAL_READ: 'credential:read',
  CREDENTIAL_WRITE: 'credential:write',
  CREDENTIAL_DELETE: 'credential:delete',

  // MCP 서버 관리
  MCP_READ: 'mcp:read',
  MCP_WRITE: 'mcp:write',
  MCP_DELETE: 'mcp:delete',
  MCP_DEPLOY: 'mcp:deploy',

  // 워크스페이스 관리
  WORKSPACE_READ: 'workspace:read',
  WORKSPACE_WRITE: 'workspace:write',
  WORKSPACE_DELETE: 'workspace:delete',
  WORKSPACE_ADMIN: 'workspace:admin',

  // 시스템 관리
  SYSTEM_ADMIN: 'system:admin',
  AUDIT_READ: 'audit:read',
} as const;

// 역할별 권한 매핑
const rolePermissions: Record<UserRole, string[]> = {
  [UserRole.USER]: [
    permissions.USER_READ,
    permissions.WORKFLOW_READ,
    permissions.WORKFLOW_WRITE,
    permissions.WORKFLOW_EXECUTE,
    permissions.CREDENTIAL_READ,
    permissions.CREDENTIAL_WRITE,
    permissions.MCP_READ,
    permissions.MCP_WRITE,
    permissions.MCP_DEPLOY,
    permissions.WORKSPACE_READ,
  ],
  [UserRole.ADMIN]: [
    permissions.USER_READ,
    permissions.USER_WRITE,
    permissions.WORKFLOW_READ,
    permissions.WORKFLOW_WRITE,
    permissions.WORKFLOW_DELETE,
    permissions.WORKFLOW_EXECUTE,
    permissions.CREDENTIAL_READ,
    permissions.CREDENTIAL_WRITE,
    permissions.CREDENTIAL_DELETE,
    permissions.MCP_READ,
    permissions.MCP_WRITE,
    permissions.MCP_DELETE,
    permissions.MCP_DEPLOY,
    permissions.WORKSPACE_READ,
    permissions.WORKSPACE_WRITE,
    permissions.WORKSPACE_DELETE,
    permissions.WORKSPACE_ADMIN,
    permissions.AUDIT_READ,
  ],
  [UserRole.SUPER_ADMIN]: [
    permissions.USER_READ,
    permissions.USER_WRITE,
    permissions.USER_DELETE,
    permissions.USER_ADMIN,
    permissions.WORKFLOW_READ,
    permissions.WORKFLOW_WRITE,
    permissions.WORKFLOW_DELETE,
    permissions.WORKFLOW_EXECUTE,
    permissions.CREDENTIAL_READ,
    permissions.CREDENTIAL_WRITE,
    permissions.CREDENTIAL_DELETE,
    permissions.MCP_READ,
    permissions.MCP_WRITE,
    permissions.MCP_DELETE,
    permissions.MCP_DEPLOY,
    permissions.WORKSPACE_READ,
    permissions.WORKSPACE_WRITE,
    permissions.WORKSPACE_DELETE,
    permissions.WORKSPACE_ADMIN,
    permissions.SYSTEM_ADMIN,
    permissions.AUDIT_READ,
  ],
};

// 역할 체크 함수
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole]?.includes(requiredRole) || false;
}

// 권한 체크 함수
export function hasPermission(userRole: UserRole, permission: string): boolean {
  return rolePermissions[userRole]?.includes(permission) || false;
}

// 역할 기반 접근 제어 미들웨어
export function requireRole(requiredRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const userRole = req.user.role as UserRole;
    if (!hasRole(userRole, requiredRole)) {
      return res.status(403).json({ 
        error: '권한이 부족합니다.',
        required: requiredRole,
        current: userRole
      });
    }

    next();
  };
}

// 권한 기반 접근 제어 미들웨어
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const userRole = req.user.role as UserRole;
    if (!hasPermission(userRole, permission)) {
      return res.status(403).json({ 
        error: '권한이 부족합니다.',
        required: permission,
        current: userRole
      });
    }

    next();
  };
}

// 다중 권한 체크 미들웨어
export function requireAnyPermission(permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const userRole = req.user.role as UserRole;
    const hasAnyPermission = permissions.some(permission => 
      hasPermission(userRole, permission)
    );

    if (!hasAnyPermission) {
      return res.status(403).json({ 
        error: '권한이 부족합니다.',
        required: permissions,
        current: userRole
      });
    }

    next();
  };
}

// 리소스 소유자 체크 미들웨어
export function requireResourceOwner(resourceIdParam: string = 'id') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const resourceId = req.params[resourceIdParam];
    const userId = req.user.id;

    // 관리자는 모든 리소스에 접근 가능
    const userRole = req.user.role as UserRole;
    if (hasRole(userRole, UserRole.ADMIN)) {
      return next();
    }

    // 리소스 소유자 체크는 각 서비스에서 구현
    // 여기서는 기본적인 사용자 ID 체크만 수행
    if (resourceId === userId) {
      return next();
    }

    return res.status(403).json({ 
      error: '리소스에 대한 접근 권한이 없습니다.' 
    });
  };
}

// 워크스페이스 멤버 체크 미들웨어
export function requireWorkspaceMember(workspaceIdParam: string = 'workspaceId') {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const workspaceId = req.params[workspaceIdParam];
    const userId = req.user.id;

    // 슈퍼 관리자는 모든 워크스페이스에 접근 가능
    const userRole = req.user.role as UserRole;
    if (hasRole(userRole, UserRole.SUPER_ADMIN)) {
      return next();
    }

    try {
      // 워크스페이스 멤버십 체크
      const { prisma } = await import('../config/database');
      const membership = await prisma.workspaceUser.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId,
          },
        },
      });

      if (!membership) {
        return res.status(403).json({ 
          error: '워크스페이스에 대한 접근 권한이 없습니다.' 
        });
      }

      // 워크스페이스 역할을 요청에 추가
      req.workspaceRole = membership.role;
      next();
    } catch (error) {
      console.error('워크스페이스 멤버십 체크 오류:', error);
      return res.status(500).json({ 
        error: '권한 확인 중 오류가 발생했습니다.' 
      });
    }
  };
}

// 워크스페이스 역할 체크 미들웨어
export function requireWorkspaceRole(requiredRole: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    // 슈퍼 관리자는 모든 워크스페이스 역할에 접근 가능
    const userRole = req.user.role as UserRole;
    if (hasRole(userRole, UserRole.SUPER_ADMIN)) {
      return next();
    }

    const workspaceRole = req.workspaceRole;
    if (!workspaceRole) {
      return res.status(403).json({ 
        error: '워크스페이스 역할이 확인되지 않았습니다.' 
      });
    }

    // 워크스페이스 역할 계층 구조
    const workspaceRoleHierarchy: Record<string, string[]> = {
      'OWNER': ['OWNER', 'ADMIN', 'MEMBER'],
      'ADMIN': ['ADMIN', 'MEMBER'],
      'MEMBER': ['MEMBER'],
    };

    if (!workspaceRoleHierarchy[workspaceRole]?.includes(requiredRole)) {
      return res.status(403).json({ 
        error: '워크스페이스 내 권한이 부족합니다.',
        required: requiredRole,
        current: workspaceRole
      });
    }

    next();
  };
} 