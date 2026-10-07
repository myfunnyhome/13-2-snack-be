import type { CookieOptions, Request, Response } from 'express';
import ms, { StringValue } from 'ms';

import {
  invitationSignupSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  signinSchema,
  superAdminSignupSchema,
} from './auth.schema';
import * as authService from './auth.service';

const isProduction = process.env.NODE_ENV === 'production';

// 브라우저는 프론트 도메인의 /api rewrite로만 요청하므로(같은 출처) 다른 사이트 요청에 쿠키가 필요 없다.
// Lax로 두어 다른 사이트에서 보낸 POST·PATCH·DELETE에는 쿠키가 붙지 않게 한다. (CSRF 1차 방어)

// 쿠키 속성은 여기 한 곳에서 관리한다. 삭제할 때도 같은 속성이어야 브라우저가 지운다.
export const clearCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  path: '/',
};

// accessToken, refreshToken 쿠키 모두 refresh 수명만큼 유지한다.
const authCookieOptions: CookieOptions = {
  ...clearCookieOptions,
  maxAge: ms((process.env.JWT_REFRESH_EXPIRES_IN ?? '3d') as StringValue),
};

export async function signup(req: Request, res: Response): Promise<void> {
  const invitationToken = req.body?.invitationToken;

  const result =
    invitationToken !== undefined
      ? await authService.signupWithInvitation(
          invitationSignupSchema.parse(req.body),
        )
      : await authService.signupSuperAdmin(
          superAdminSignupSchema.parse(req.body),
        );

  res.status(201).json({
    success: true,
    data: result,
  });
}

export async function signin(req: Request, res: Response): Promise<void> {
  const data = signinSchema.parse(req.body);

  const { user, accessToken, refreshToken } = await authService.signin(data);

  res
    .cookie('accessToken', accessToken, authCookieOptions)
    .cookie('refreshToken', refreshToken, authCookieOptions)
    .status(200)
    .json({
      success: true,
      data: user,
    });
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { accessToken, refreshToken } = await authService.refresh(
      req.cookies.refreshToken,
      req.auth!.userId,
    );

    res
      .cookie('accessToken', accessToken, authCookieOptions)
      .cookie('refreshToken', refreshToken, authCookieOptions)
      .status(200)
      .json({ success: true });
  } catch (error) {
    res
      .clearCookie('accessToken', clearCookieOptions)
      .clearCookie('refreshToken', clearCookieOptions);

    throw error;
  }
}

export async function signout(req: Request, res: Response): Promise<void> {
  await authService.signout(req.auth!.userId);

  res
    .clearCookie('accessToken', clearCookieOptions)
    .clearCookie('refreshToken', clearCookieOptions)
    .status(200)
    .json({ success: true });
}

export async function requestPasswordReset(
  req: Request,
  res: Response,
): Promise<void> {
  const data = requestPasswordResetSchema.parse(req.body);

  await authService.requestPasswordReset(data);

  res.status(200).json({
    success: true,
    message: '해당 이메일로 가입된 계정이 있다면 재설정 링크를 보내드렸습니다.',
  });
}

export async function resetPassword(
  req: Request,
  res: Response,
): Promise<void> {
  const data = resetPasswordSchema.parse(req.body);

  await authService.resetPassword(data);

  res.status(200).json({
    success: true,
    message: '비밀번호가 변경되었습니다.',
  });
}
