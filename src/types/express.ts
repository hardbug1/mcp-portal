import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, 'passwordHash'>;
      workspace?: {
        id: string;
        role: string;
        permissions: Record<string, boolean>;
      };
    }
  }
} 