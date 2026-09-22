import type { Request, Response } from 'express';

import { organizationIdSchema, updateBudgetSchema } from './budgets.schema';
import * as budgetService from './budgets.service';

export async function getBudget(req: Request, res: Response): Promise<void> {
  const { organizationId } = organizationIdSchema.parse({
    organizationId: req.auth!.organizationId,
  });

  const result = await budgetService.getBudget(organizationId);

  res.status(200).json({
    success: true,
    data: result,
  });
}

export async function patchBudget(req: Request, res: Response): Promise<void> {
  const { organizationId } = organizationIdSchema.parse({
    organizationId: req.auth!.organizationId,
  });

  const { startingBudget, defaultBudget } = updateBudgetSchema.parse(req.body);

  const result = await budgetService.updateBudget(
    organizationId,
    startingBudget,
    defaultBudget,
  );

  res.status(200).json({
    success: true,
    data: result,
  });
}

export async function getBudgetSummary(
  req: Request,
  res: Response,
): Promise<void> {
  const { organizationId } = organizationIdSchema.parse({
    organizationId: req.auth!.organizationId,
  });

  const result = await budgetService.getBudgetSummary(organizationId);

  res.status(200).json({
    success: true,
    data: result,
  });
}
