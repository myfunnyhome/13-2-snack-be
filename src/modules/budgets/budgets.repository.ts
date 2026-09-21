import { prisma } from '../../config/prisma';
import type { Budget, Organization } from '../../generated/prisma/client';
import type { Prisma } from '../../generated/prisma/client';

//이번달 Budget 데이터 가져오기
// Budget에서 startingBudget, spentAmount (currentMonthBudget, currentMonthSpending)
export async function findCurrentMonthBudget(
  organizationId: number,
): Promise<Budget | null> {
  const today = new Date();
  const thisYear = today.getFullYear();
  const thisMonth = today.getMonth() + 1;

  return await prisma.budget.findUnique({
    where: {
      organizationId_year_month: {
        organizationId,
        year: thisYear,
        month: thisMonth,
      },
    },
  });
}

//저번달 Budget 데이터 가져오기
// Budget에서 startingBudget, spentAmount (previousMonthBudget, previousMonthSpending)
export async function findPreviousMonthBudget(
  organizationId: number,
): Promise<Budget | null> {
  const today = new Date();
  const previousDate = new Date(today.getFullYear(), today.getMonth() - 1);
  const previousYear = previousDate.getFullYear();
  const previousMonth = previousDate.getMonth() + 1;

  return await prisma.budget.findUnique({
    where: {
      organizationId_year_month: {
        organizationId,
        year: previousYear,
        month: previousMonth,
      },
    },
  });
}

//올해 총 spentAmount 데이터 가져오기
// Budget에서 올해의 spentAmount 합산 (currentYearSpending)
export async function findCurrentYearSpending(
  organizationId: number,
): Promise<number> {
  const today = new Date();
  const thisYear = today.getFullYear();

  const budget = await prisma.budget.aggregate({
    where: {
      organizationId,
      year: thisYear,
    },
    _sum: {
      spentAmount: true,
    },
  });

  return budget._sum.spentAmount ?? 0;
}

//저번 해 총 spentAmount 데이터 가져오기
// Budget에서 작년 spentAmount 합산 (previousYearSpending)
export async function findPreviousYearSpending(
  organizationId: number,
): Promise<number> {
  const today = new Date();
  const previousYear = today.getFullYear() - 1;

  const budget = await prisma.budget.aggregate({
    where: {
      organizationId,
      year: previousYear,
    },
    _sum: {
      spentAmount: true,
    },
  });

  return budget._sum.spentAmount ?? 0;
}

// 매달의 디폴트 예산 데이터 가져오기
// Organization에서 defaultBudget (monthlyStartingBudget)
export async function findDefaultBudget(
  organizationId: number,
): Promise<Organization['defaultBudget']> {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    select: {
      defaultBudget: true,
    },
  });

  return organization?.defaultBudget ?? 0;
}

// 이번달 Budget의 예산 데이터 수정하기
// Budget에서 startingBudget (currentMonthBudget)
// tx를 사용해서 아래의 updateDefaultBudget과 transaction에 함께 쓰일 수 있게 한다.
export async function updateStartingBudget(
  tx: Prisma.TransactionClient,
  organizationId: number,
  startingBudget: number,
): Promise<Budget> {
  const today = new Date();
  const thisYear = today.getFullYear();
  const thisMonth = today.getMonth() + 1;

  return tx.budget.update({
    where: {
      organizationId_year_month: {
        organizationId,
        year: thisYear,
        month: thisMonth,
      },
    },
    data: {
      startingBudget,
    },
  });
}

// 매달의 디폴트 예산 데이터 수정하기
// Organization에서 defaultBudget (monthlyStartingBudget)
// tx를 사용해서 위의 updateStartingBudget과 transaction에 함께 쓰일 수 있게 한다.
export async function updateDefaultBudget(
  tx: Prisma.TransactionClient,
  organizationId: number,
  defaultBudget: number,
): Promise<Organization['defaultBudget']> {
  const organization = await tx.organization.update({
    where: {
      id: organizationId,
    },
    data: {
      defaultBudget,
    },
    select: {
      defaultBudget: true,
    },
  });

  return organization.defaultBudget;
}
