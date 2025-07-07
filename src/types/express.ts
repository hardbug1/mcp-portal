import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      workspaceRole?: string;
    }
  }
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
} 