// src/schedulers/budget.scheduler.ts
import cron from 'node-cron';

import { createMonthlyBudgets } from '../modules/budgets/budgets.service';

export async function createMonthlyBudgetsOnStartup() {
  console.log('✅ Budget 데이터 필요 시 생성 중입니다.');
  await createMonthlyBudgets();
}
export function startBudgetScheduler() {
  cron.schedule(
    '0 0 1 * *',
    async () => {
      console.log('✅ Budget 데이터 필요 시 생성 중입니다.');
      await createMonthlyBudgets();
    },
    {
      timezone: 'Asia/Seoul',
    },
  );
}
