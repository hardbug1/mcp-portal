import { User } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      workspace?: {
        id: string;
        role: string;
        permissions: Record<string, boolean>;
      };
    }
  }
} 