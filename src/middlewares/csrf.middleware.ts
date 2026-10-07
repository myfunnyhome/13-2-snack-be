import type { NextFunction, Request, Response } from 'express';

import { ForbiddenError } from '../types/errors';

const CSRF_HEADER = 'x-csrf-protection';
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

export function requireCsrfHeader(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (SAFE_METHODS.includes(req.method) || req.get(CSRF_HEADER) === '1') {
    next();
    return;
  }

  next(new ForbiddenError('허용되지 않은 요청입니다.', 'CSRF_REJECTED'));
}
