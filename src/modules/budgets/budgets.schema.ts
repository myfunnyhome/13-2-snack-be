import { z } from 'zod';

export const organizationIdSchema = z
  .object({
    organizationId: z.number().int().positive(),
  })
  .strict();

export const updateBudgetSchema = z
  .object({
    startingBudget: z.number().int().nonnegative().optional(),
    defaultBudget: z.number().int().nonnegative().optional(),
  })
  .strict();
