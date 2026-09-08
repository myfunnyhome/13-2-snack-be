import type { CookieOptions, Request, Response } from 'express';
import ms, { StringValue } from 'ms';

import { signinSchema, superAdminSignupSchema } from './auth.schema';
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
  const data = superAdminSignupSchema.parse(req.body);

  const result = await authService.signupSuperAdmin(data);

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
