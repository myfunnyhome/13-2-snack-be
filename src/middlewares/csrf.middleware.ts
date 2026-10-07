import type { NextFunction, Request, Response } from 'express';

import { ForbiddenError } from '../types/errors';

/*
@ CSRF 방어 (OWASP CSRF Cheat Sheet - Custom Request Headers)
- HTML form은 커스텀 헤더를 붙일 수 없고, 다른 출처의 fetch가 붙이면 CORS preflight에서 막힌다.
  그래서 변경 요청에 X-CSRF-Protection 헤더가 있으면 우리 프론트(또는 허용된 출처)에서 보낸 요청으로 본다.
- 조회 요청(GET/HEAD)과 preflight(OPTIONS)는 상태를 바꾸지 않으므로 검사하지 않는다.
- app.ts에서 cors 다음, 라우터 앞에 등록한다.
*/

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
