export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface UpdateUserProfileRequest {
  name?: string;
  avatar?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  isEmailVerified?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLoginAt';
  sortOrder?: 'asc' | 'desc';
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByRole: Record<UserRole, number>;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface DeleteUserRequest {
  transferWorkflowsTo?: string; // 다른 사용자 ID
  deleteWorkflows?: boolean;
}

export interface UserWorkspaceInfo {
  workspaceId: string;
  workspaceName: string;
  role: string;
  joinedAt: Date;
} 