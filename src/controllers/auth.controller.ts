import type { CookieOptions, Request, Response } from 'express';

import { signinSchema, superAdminSignupSchema } from '../schemas/auth.schema';
import * as authService from '../services/auth.service';

const isProduction = process.env.NODE_ENV === 'production';

function createCookieOptions(maxAge?: number): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    ...(maxAge !== undefined && { maxAge }),
  };
}

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const clearCookieOptions = createCookieOptions();

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

  res.cookie(
    'accessToken',
    accessToken,
    createCookieOptions(ACCESS_TOKEN_MAX_AGE),
  );
  res.cookie(
    'refreshToken',
    refreshToken,
    createCookieOptions(REFRESH_TOKEN_MAX_AGE),
  );

  res.status(200).json({
    success: true,
    data: { user },
  });
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  const { accessToken, refreshToken } = await authService.refresh(
    req.cookies.refreshToken,
    req.auth!.userId,
  );

  res.cookie(
    'accessToken',
    accessToken,
    createCookieOptions(ACCESS_TOKEN_MAX_AGE),
  );
  res.cookie(
    'refreshToken',
    refreshToken,
    createCookieOptions(REFRESH_TOKEN_MAX_AGE),
  );

  res.status(200).json({ success: true });
}

export async function signout(req: Request, res: Response): Promise<void> {
  await authService.signout(req.auth!.userId);

  res.clearCookie('accessToken', clearCookieOptions);
  res.clearCookie('refreshToken', clearCookieOptions);

  res.status(200).json({ success: true });
}
