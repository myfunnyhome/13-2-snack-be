import type { NextFunction, Request, Response } from 'express';
import { type IsRevoked, expressjwt } from 'express-jwt';

import { Role } from '../generated/prisma/client';
import { findTokenOwnerStatus } from '../modules/auth/auth.repository';
import { ForbiddenError, UnauthorizedError } from '../types/errors';
import { isTokenRevoked } from '../utils/authToken';

const checkTokenRevoked: IsRevoked = async (_req, token) => {
  const payload = token?.payload;

  if (!payload || typeof payload === 'string') {
    return true;
  }

  const owner =
    typeof payload.userId === 'number'
      ? await findTokenOwnerStatus(payload.userId)
      : null;

  return isTokenRevoked(payload.tokenVersion, owner);
};

const verifyAccessTokenSignature = expressjwt({
  secret: process.env.JWT_ACCESS_SECRET!,
  algorithms: ['HS256'],
  getToken: (req) => req.cookies.accessToken,
  isRevoked: checkTokenRevoked,
});

// 서명/시크릿 검증만으로는 access와 refresh 토큰을 구분하지 못하는 상황
// (두 시크릿이 실수로 같아지는 경우 등)에 대비해, 페이로드의 type 필드까지 확인함.
function checkAccessTokenType(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (req.auth?.type !== 'access') {
    next(new UnauthorizedError());
    return;
  }
  next();
}

export const authenticate = [verifyAccessTokenSignature, checkAccessTokenType];

const verifyRefreshTokenSignature = expressjwt({
  secret: process.env.JWT_REFRESH_SECRET!,
  algorithms: ['HS256'],
  getToken: (req) => req.cookies.refreshToken,
  isRevoked: checkTokenRevoked,
});

function checkRefreshTokenType(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (req.auth?.type !== 'refresh') {
    next(new UnauthorizedError());
    return;
  }
  next();
}

export const verifyRefreshToken = [
  verifyRefreshTokenSignature,
  checkRefreshTokenType,
];

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
