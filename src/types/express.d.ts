import type { Role } from '../generated/prisma/client';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: number;
        role: Role;
        organizationId: number;
      };
    }
  }
}
