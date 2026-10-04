import type { Budget } from '../../generated/prisma/client';

export type BudgetResult = Budget & {
  defaultBudget: number;
};

// 신규 기업은 지난달 데이터가 없을 수 있으니, 지난달 Budget이 없으면 null
export type SpendingSummaryResult = {
  currentMonthBudget: Budget;
  previousMonthBudget: Budget | null;
  currentYearSpending: number;
  previousYearSpending: number;
};
