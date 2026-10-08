import type { NextFunction, Request, Response } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// 로그인 서버 보호용(L3).
// 같은 IP에서 15분 동안 성공·실패와 관계없이 로그인 요청 100회까지만 허용.
export const signinIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: {
    success: false,
    message: '로그인 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    code: 'TOO_MANY_REQUESTS',
  },
});

// signinSchema와 같은 방식으로 정규화해야 대소문자·공백만 다른 이메일이 같은 키가 된다.
function getSigninEmail(req: Request): string {
  return String(req.body?.email ?? '')
    .trim()
    .toLowerCase();
}

// 로그인 반복 실패 감지용(L1, L2).
// 비밀번호 인증 실패(401)만 남기고, 기준을 넘으면 차단하지 않고 Turnstile을 요구한다.
const signinFailureOptions = {
  windowMs: 15 * 60 * 1000,
  skipSuccessfulRequests: true,
  requestWasSuccessful: (_req: Request, res: Response) =>
    res.statusCode !== 401,
  handler: (_req: Request, res: Response, next: NextFunction) => {
    res.locals.turnstileRequired = true;
    next();
  },
  // 이메일 단위 남은 횟수가 응답 헤더로 노출되지 않게 한다.
  standardHeaders: false,
  legacyHeaders: false,
};

// L1: 같은 이메일 + 같은 IP에서 15분 동안 비밀번호 실패 5회 이후 Turnstile 요구.
export const signinEmailIpLimiter = rateLimit({
  ...signinFailureOptions,
  limit: 5,
  requestPropertyName: 'signinEmailIpLimit',
  keyGenerator: (req) =>
    `${getSigninEmail(req)}:${ipKeyGenerator(req.ip ?? '')}`,
});

// L2: 같은 이메일에서 15분 동안 비밀번호 실패 10회 이후 Turnstile 요구.
// 여러 IP에서 한 이메일을 노리는 경우용. 이메일 자체를 잠그지는 않는다.
export const signinEmailLimiter = rateLimit({
  ...signinFailureOptions,
  limit: 10,
  requestPropertyName: 'signinEmailLimit',
  keyGenerator: getSigninEmail,
});

// 최고관리자 최초 가입(공개 가입) 남용 방어용.
// 토큰 없이 이메일/비밀번호만으로 가입 가능한 경로라 대량 자동 생성 위협이 실재함.
// 같은 IP에서 1시간 동안 10회까지만 허용.
const superAdminSignupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: '가입 요청이 너무 많습니다. 1시간 후 다시 시도해주세요.',
  },
});

// 초대 가입은 CSPRNG 토큰(2^256 경우의 수)이 있어야만 성공하므로
// 대량 자동화 공격 자체가 사실상 불가능함. 조직 도입 초기 등
// 같은 네트워크에서 여러 명이 동시에 가입하는 정상 상황을 막지 않기 위해
// rate limit을 적용하지 않고, SUPER_ADMIN 가입에만 제한을 건다.
export function signupRateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.body?.invitationToken !== undefined) {
    next();
    return;
  }

  superAdminSignupLimiter(req, res, next);
}

// 비밀번호 재설정 메일 스팸 발송 방지용.
// 같은 IP에서 1시간 동안 5회까지만 재설정 요청 허용.
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: '재설정 요청이 너무 많습니다. 1시간 후 다시 시도해주세요.',
  },
});
