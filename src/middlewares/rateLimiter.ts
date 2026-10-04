import type { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

// 로그인 브루트포스(비밀번호 대입 공격) 방어용.
// 같은 IP에서 15분 동안 5회까지만 로그인 시도 허용.
export const signinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: '로그인 시도가 너무 많습니다. 15분 후 다시 시도해주세요.',
  },
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
