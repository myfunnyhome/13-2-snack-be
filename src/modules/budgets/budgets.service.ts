import { prisma } from '../../config/prisma';
import { BadRequestError, NotFoundError } from '../../types/errors';
import * as budgetRepository from './budgets.repository';
import { BudgetResult, SpendingSummaryResult } from './budgets.type';

// 이번달 예산, 기본 예산 조회
export async function getBudget(organizationId: number): Promise<BudgetResult> {
  const monthlyBudget =
    await budgetRepository.findCurrentMonthBudget(organizationId);
  if (monthlyBudget === null)
    throw new NotFoundError('예산 정보를 찾을 수 없었습니다.');

  const defaultBudget =
    await budgetRepository.findDefaultBudget(organizationId);
  if (defaultBudget === null)
    throw new NotFoundError('예산 정보를 찾을 수 없었습니다.');

  return {
    ...monthlyBudget,
    defaultBudget,
  };
}

// 이번달 예산, 기본 예산 수정
export async function updateBudget(
  organizationId: number,
  startingBudget?: number,
  defaultBudget?: number,
): Promise<BudgetResult> {
  if (startingBudget === undefined && defaultBudget === undefined) {
    throw new BadRequestError('수정할 값을 입력해야 합니다.');
  }

  await prisma.$transaction(async (tx) => {
    if (startingBudget !== undefined) {
      await budgetRepository.updateStartingBudget(
        tx,
        organizationId,
        startingBudget,
      );
    }

    if (defaultBudget !== undefined) {
      await budgetRepository.updateDefaultBudget(
        tx,
        organizationId,
        defaultBudget,
      );
    }
  });

  return await getBudget(organizationId);
}

// 이번달, 지난달, 올해 예산 및 총 지출액 조회
export async function getBudgetSummary(
  organizationId: number,
): Promise<SpendingSummaryResult> {
  const currentMonthBudget =
    await budgetRepository.findCurrentMonthBudget(organizationId);
  const previousMonthBudget =
    await budgetRepository.findPreviousMonthBudget(organizationId);

  if (!currentMonthBudget) {
    throw new NotFoundError('예산 정보를 찾을 수 없었습니다.');
  }

  return {
    currentMonthBudget,
    previousMonthBudget,
    currentYearSpending:
      await budgetRepository.findCurrentYearSpending(organizationId),
    previousYearSpending:
      await budgetRepository.findPreviousYearSpending(organizationId),
  };
}

//매달 Budget 데이터 생성
export async function createBudget(organizationId: number) {
  const defaultBudget =
    await budgetRepository.findDefaultBudget(organizationId);
  if (defaultBudget === null) {
    throw new NotFoundError('defaultBudget 데이터를 찾을 수 없었습니다.');
  }

  return await budgetRepository.createBudget(defaultBudget, organizationId);
}

// 매달 모든 Organization의 Budget 생성
export async function createMonthlyBudgets(): Promise<void> {
  const organizationIds = await budgetRepository.findAllOrganizationIds();
  const failedOrganizationIds: number[] = [];

  for (const organizationId of organizationIds) {
    try {
      await createBudget(organizationId);
    } catch (error) {
      failedOrganizationIds.push(organizationId);

      console.error(
        `Budget 생성 실패 - organizationId: ${organizationId}`,
        error,
      );
    }
  }

  if (failedOrganizationIds.length > 0) {
    throw new Error(
      `Budget 생성 실패 조직: ${failedOrganizationIds.join(', ')}`,
    );
  }
}
