import type { NextFunction, Request, Response } from 'express';
import { expressjwt } from 'express-jwt';

import { Role } from '../generated/prisma/client';
import { ForbiddenError } from '../types/errors';

export const authenticate = expressjwt({
  secret: process.env.JWT_ACCESS_SECRET!,
  algorithms: ['HS256'],
  getToken: (req) => req.cookies.accessToken,
});

export const verifyRefreshToken = expressjwt({
  secret: process.env.JWT_REFRESH_SECRET!,
  algorithms: ['HS256'],
  getToken: (req) => req.cookies.refreshToken,
});

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(new Error('authorize는 authenticate 뒤에 연결되어야 합니다.'));
      return;
    }
    if (!allowedRoles.includes(req.auth.role)) {
      next(new ForbiddenError('접근 권한이 없습니다.'));
      return;
    }
    next();
  };
}
