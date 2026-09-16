import type { Request, Response } from 'express';

import {
  createInvitationSchema,
  invitationTokenParamsSchema,
} from './invitation.schema';
import * as invitationService from './invitation.service';

export async function getByToken(req: Request, res: Response): Promise<void> {
  const { token } = invitationTokenParamsSchema.parse(req.params);

  const result = await invitationService.getByToken(token);

  res.status(200).json({
    success: true,
    data: result,
  });
}

export async function create(req: Request, res: Response): Promise<void> {
  const data = createInvitationSchema.parse(req.body);

  const result = await invitationService.create({
    ...data,
    organizationId: req.auth!.organizationId,
    requesterId: req.auth!.userId,
  });

  res.status(201).json({
    success: true,
    data: result,
  });
}
