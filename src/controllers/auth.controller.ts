import type { Request, Response } from 'express';

import { signinSchema, superAdminSignupSchema } from '../schemas/auth.schema';
import * as authService from '../services/auth.service';

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

  res.status(200).json({
    success: true,
    data: { user, accessToken, refreshToken },
  });
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  const { accessToken, refreshToken } = await authService.refresh(
    req.body.refreshToken,
    req.auth!.userId,
  );

  res.status(200).json({
    success: true,
    data: { accessToken, refreshToken },
  });
}

export async function signout(req: Request, res: Response): Promise<void> {
  await authService.signout(req.auth!.userId);

  res.status(200).json({ success: true });
}
