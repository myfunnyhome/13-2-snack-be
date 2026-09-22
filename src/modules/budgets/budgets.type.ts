import type { Budget } from '../../generated/prisma/client';

export type BudgetResult = Budget & {
  defaultBudget: number;
};

export type SpendingSummaryResult = {
  currentMonthBudget: Budget;
  previousMonthBudget: Budget;
  currentYearSpending: number;
  previousYearSpending: number;
};
