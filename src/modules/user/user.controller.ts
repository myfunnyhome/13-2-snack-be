import type { Request, Response } from 'express';

import {
  changeRoleSchema,
  searchUsersSchema,
  updateProfileSchema,
  userIdParamsSchema,
} from './user.schema';
import * as userService from './user.service';

export async function getUsers(req: Request, res: Response): Promise<void> {
  const query = searchUsersSchema.parse(req.query);

  const result = await userService.searchUsers({
    ...query,
    organizationId: req.auth!.organizationId,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
}

export async function changeUserRole(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = userIdParamsSchema.parse(req.params);
  const data = changeRoleSchema.parse(req.body);

  const result = await userService.changeRole({
    ...data,
    targetUserId: id,
    requesterId: req.auth!.userId,
    organizationId: req.auth!.organizationId,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
}

export async function softDeleteUser(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = userIdParamsSchema.parse(req.params);

  const result = await userService.deactivateUser({
    targetUserId: id,
    requesterId: req.auth!.userId,
    organizationId: req.auth!.organizationId,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const result = await userService.getProfile(req.auth!.userId);

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

  const result = await userService.updateProfile({
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
