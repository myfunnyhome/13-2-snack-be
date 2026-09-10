import type { Request, Response } from 'express';

import {
  createInvitationSchema,
  invitationIdParamsSchema,
} from './invitation.schema';
import * as invitationService from './invitation.service';

export async function getById(req: Request, res: Response): Promise<void> {
  const { id } = invitationIdParamsSchema.parse(req.params);

  const result = await invitationService.getById(id);

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
  });

  res.status(201).json({
    success: true,
    data: result,
  });
}
