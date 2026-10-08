import type { NextFunction, Request, Response } from 'express';

import { ForbiddenError } from '../types/errors';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

export function requireCsrfHeader(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  // req.xhr: X-Requested-With가 XMLHttpRequest인지 Express가 확인한다.
  if (SAFE_METHODS.includes(req.method) || req.xhr) {
    next();
    return;
  }

  next(new ForbiddenError('허용되지 않은 요청입니다.', 'CSRF_REJECTED'));
}
