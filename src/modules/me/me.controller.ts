import type { Request, Response } from 'express';

import { updateProfileSchema } from './me.schema';
import * as meService from './me.service';

export async function getMe(req: Request, res: Response): Promise<void> {
  const result = await meService.getProfile(req.auth!.userId);

  res.status(200).json({
    success: true,
    data: result,
  });
}

export async function updateProfile(
  req: Request,
  res: Response,
): Promise<void> {
  const data = updateProfileSchema.parse(req.body);

  const result = await meService.updateProfile({
    ...data,
    userId: req.auth!.userId,
    role: req.auth!.role,
    organizationId: req.auth!.organizationId,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
}
