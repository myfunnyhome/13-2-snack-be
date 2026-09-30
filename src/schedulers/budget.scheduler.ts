// src/schedulers/budget.scheduler.ts
import cron from 'node-cron';

import { createMonthlyBudgets } from '../modules/budgets/budgets.service';

// 크론: 서버 기동 이후 실행되므로 재시도 대기 중에도 다른 API 요청은 처리 가능
const CRON_RETRY_COUNT = 3; // 첫 시도 이후 재시도 횟수 (총 4회)
const CRON_RETRY_INTERVAL_MS = 5 * 60 * 1000; // 5분

// 기동 시: app.listen 전에 실행되므로 짧은 간격으로 재시도
const STARTUP_RETRY_COUNT = 3;
const STARTUP_RETRY_INTERVAL_MS = 3 * 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 실패 시 재시도하고, 재시도를 모두 소진하면 마지막 에러를 throw
async function createMonthlyBudgetsWithRetry(
  label: string,
  retryCount: number,
  intervalMs: number,
): Promise<void> {
  for (let attempt = 0; ; attempt++) {
    try {
      await createMonthlyBudgets();
      return;
    } catch (error) {
      console.error(
        `❌ [${label}] Budget 생성 실패 (${attempt + 1}/${retryCount + 1}회차)`,
        error,
      );

      if (attempt >= retryCount) throw error;

      await sleep(intervalMs);
    }
  }
}

export async function createMonthlyBudgetsOnStartup(): Promise<void> {
  console.log('✅ [기동] Budget 데이터 필요 시 생성 중입니다.');
  // 재시도 후에도 실패하면 throw → server.ts의 catch에서 exit(1)
  await createMonthlyBudgetsWithRetry(
    '기동',
    STARTUP_RETRY_COUNT,
    STARTUP_RETRY_INTERVAL_MS,
  );
}

export function startBudgetScheduler(): void {
  cron.schedule(
    '0 0 1 * *',
    async () => {
      console.log('✅ [크론] Budget 데이터 필요 시 생성 중입니다.');
      try {
        await createMonthlyBudgetsWithRetry(
          '크론',
          CRON_RETRY_COUNT,
          CRON_RETRY_INTERVAL_MS,
        );
      } catch (error) {
        // TODO: Sentry 도입 후 Sentry.captureException(error) 추가
        console.error(
          '❌ [크론] Budget 생성 재시도를 모두 소진했습니다. 수동 조치 필요',
          error,
        );
      }
    },
    {
      timezone: 'Asia/Seoul',
    },
  );
}
