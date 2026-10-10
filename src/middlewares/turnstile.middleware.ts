import type { NextFunction, Request, Response } from 'express';

import { ForbiddenError } from '../types/errors';

const SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const SITEVERIFY_TIMEOUT_MS = 5000;
const TOKEN_MAX_LENGTH = 2048;

type SiteverifyErrorCode =
  | 'missing-input-secret'
  | 'invalid-input-secret'
  | 'missing-input-response'
  | 'invalid-input-response'
  | 'bad-request'
  | 'timeout-or-duplicate'
  | 'internal-error';

type SiteverifyResult = {
  success: boolean;
  'error-codes': SiteverifyErrorCode[];
  hostname?: string;
  action?: string;
  metadata?: { result_with_testing_key?: boolean };
};

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

    if (!response.ok) {
      console.warn('Turnstile siteverify HTTP error:', response.status);
      return false;
    }

    const result = (await response.json()) as SiteverifyResult;

    if (!result.success) {
      console.warn('Turnstile siteverify rejected:', result['error-codes']);
      return false;
    }

    if (
      process.env.NODE_ENV !== 'production' &&
      result.metadata?.result_with_testing_key
    ) {
      return true;
    }

    const hostnameMatch =
      result.hostname === new URL(process.env.CLIENT_URL ?? '').hostname;
    const actionMatch = result.action === 'signin';

    if (!hostnameMatch || !actionMatch) {
      console.warn('Turnstile siteverify mismatch:', {
        hostnameMatch,
        actionMatch,
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Turnstile siteverify failed:', error);
    return false;
  }
}

export async function requireTurnstileIfFlagged(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token: unknown = req.body?.turnstileToken;

  if (typeof token !== 'string' || token.length === 0) {
    if (res.locals.turnstileRequired) {
      throw new ForbiddenError(
        '보안 확인이 필요합니다. 확인을 완료한 뒤 다시 로그인해주세요.',
        'TURNSTILE_REQUIRED',
      );
    }

    next();
    return;
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
