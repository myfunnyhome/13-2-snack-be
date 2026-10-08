import type { NextFunction, Request, Response } from 'express';

import { ForbiddenError } from '../types/errors';

const SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const SITEVERIFY_TIMEOUT_MS = 5000;
const TOKEN_MAX_LENGTH = 2048;

type SiteverifyResult = {
  success: boolean;
  hostname?: string;
  action?: string;
  metadata?: { result_with_testing_key?: boolean };
};

// 장애·timeout·설정 누락은 모두 false로 처리한다(fail-closed).
async function isTurnstileTokenValid(token: string): Promise<boolean> {
  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
      signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
    });
    const result = (await response.json()) as SiteverifyResult;

    if (!result.success) return false;

    // Cloudflare 테스트 키 응답은 hostname이 example.com이고 action이 없다.
    if (result.metadata?.result_with_testing_key) return true;

    return (
      result.hostname === new URL(process.env.CLIENT_URL ?? '').hostname &&
      result.action === 'signin'
    );
  } catch (error) {
    console.error('Turnstile siteverify failed:', error);
    return false;
  }
}

// 반복 실패 limiter(L1, L2)가 표시한 요청에만 Turnstile을 요구한다.
// 통과 여부는 저장하지 않으므로 다음 요청은 다시 limiter 기준으로 판단한다.
export async function requireTurnstileIfFlagged(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!res.locals.turnstileRequired) {
    next();
    return;
  }

  const token: unknown = req.body?.turnstileToken;

  if (typeof token !== 'string' || token.length === 0) {
    throw new ForbiddenError(
      '보안 확인이 필요합니다. 확인을 완료한 뒤 다시 로그인해주세요.',
      'TURNSTILE_REQUIRED',
    );
  }

  if (
    token.length > TOKEN_MAX_LENGTH ||
    !(await isTurnstileTokenValid(token))
  ) {
    throw new ForbiddenError(
      '보안 확인에 실패했습니다. 다시 확인해주세요.',
      'TURNSTILE_FAILED',
    );
  }

  next();
}
