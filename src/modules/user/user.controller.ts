import type { Request, Response } from 'express';

import {
  changeRoleSchema,
  searchUsersSchema,
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
