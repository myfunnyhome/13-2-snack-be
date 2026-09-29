// src/schedulers/budget.scheduler.ts
import cron from 'node-cron';

import { createMonthlyBudgets } from '../modules/budgets/budgets.service';

export function startBudgetScheduler() {
  cron.schedule(
    '0 0 1 * *',
    async () => {
      await createMonthlyBudgets();
    },
    {
      timezone: 'Asia/Seoul',
    },
  );
}
