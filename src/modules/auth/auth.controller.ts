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

const accessCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: ms((process.env.JWT_REFRESH_EXPIRES_IN ?? '3d') as StringValue),
  path: '/',
};

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: ms((process.env.JWT_REFRESH_EXPIRES_IN ?? '3d') as StringValue),
  path: '/',
};

const clearCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
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
    .cookie('accessToken', accessToken, accessCookieOptions)
    .cookie('refreshToken', refreshToken, refreshCookieOptions)
    .status(200)
    .json({
      success: true,
      data: user,
    });
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  const { accessToken, refreshToken } = await authService.refresh(
    req.cookies.refreshToken,
    req.auth!.userId,
  );

  res
    .cookie('accessToken', accessToken, accessCookieOptions)
    .cookie('refreshToken', refreshToken, refreshCookieOptions)
    .status(200)
    .json({ success: true });
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
