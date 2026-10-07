import { prisma } from '../../config/prisma';
import { Prisma } from '../../generated/prisma/client';
import { getKstDate } from '../../utils/date';
import { hashToken } from '../../utils/token';

// 가입 시 조직의 defaultBudget과 이번 달 Budget의 startingBudget에 함께 쓰는 초기값.
// 크론이 만드는 Budget(startingBudget = 조직 defaultBudget)과 같은 값이 되도록
// 두 필드가 항상 이 상수 하나에서 나오게 한다.
const INITIAL_BUDGET = 0;

type CreateSuperAdminParams = {
  name: string;
  email: string;
  passwordHash: string;
  organizationName: string;
  bizRegNumber: string;
};

type CreateUserWithInvitationParams = {
  invitationToken: string;
  name: string;
  email: string;
  passwordHash: string;
};

const findUserWithAccountByEmailArgs = {
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
    isActive: true,
    tokenVersion: true,
    organizationId: true,
    account: {
      select: {
        password: true,
      },
    },
  },
} satisfies Prisma.UserDefaultArgs;
type FindUserWithAccountByEmailResult = Prisma.UserGetPayload<
  typeof findUserWithAccountByEmailArgs
> | null;

const createSuperAdminArgs = {
  select: {
    id: true,
    name: true,
    users: {
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    },
  },
} satisfies Prisma.OrganizationDefaultArgs;
type CreateSuperAdminResult = Prisma.OrganizationGetPayload<
  typeof createSuperAdminArgs
>;

const createUserWithInvitationArgs = {
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
    organizationId: true,
    organization: {
      select: {
        id: true,
        name: true,
      },
    },
  },
} satisfies Prisma.UserDefaultArgs;
type CreateUserWithInvitationResult = Prisma.UserGetPayload<
  typeof createUserWithInvitationArgs
>;

const updateRefreshTokenArgs = {
  select: {
    userId: true,
  },
} satisfies Prisma.AccountDefaultArgs;
type UpdateRefreshTokenResult = Prisma.AccountGetPayload<
  typeof updateRefreshTokenArgs
>;

const findUserWithAccountByIdArgs = {
  select: {
    id: true,
    role: true,
    isActive: true,
    tokenVersion: true,
    organizationId: true,
    account: {
      select: {
        userId: true,
        refreshToken: true,
      },
    },
  },
} satisfies Prisma.UserDefaultArgs;
type FindUserWithAccountByIdResult = Prisma.UserGetPayload<
  typeof findUserWithAccountByIdArgs
> | null;

const findUserByEmailForResetArgs = {
  select: {
    id: true,
    name: true,
    email: true,
    isActive: true,
  },
} satisfies Prisma.UserDefaultArgs;
type FindUserByEmailForResetResult = Prisma.UserGetPayload<
  typeof findUserByEmailForResetArgs
> | null;

const findUserByResetTokenArgs = {
  select: {
    id: true,
  },
} satisfies Prisma.UserDefaultArgs;
type FindUserByResetTokenResult = Prisma.UserGetPayload<
  typeof findUserByResetTokenArgs
> | null;

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function createSuperAdmin({
  name,
  email,
  passwordHash,
  organizationName,
  bizRegNumber,
}: CreateSuperAdminParams): Promise<CreateSuperAdminResult> {
  // 크론(budget.scheduler)이 만드는 Budget과 같은 KST 기준의 연/월
  const today = getKstDate();

  return prisma.organization.create({
    data: {
      name: organizationName,
      bizRegNumber,
      defaultBudget: INITIAL_BUDGET,
      users: {
        create: {
          name,
          email,
          role: 'SUPER_ADMIN',
          account: {
            create: {
              password: passwordHash,
            },
          },
        },
      },
      // 가입한 달에도 이번 달 Budget이 존재하도록 조직과 함께 생성
      budgets: {
        create: {
          year: today.year(),
          month: today.month() + 1,
          startingBudget: INITIAL_BUDGET,
        },
      },
    },
    select: createSuperAdminArgs.select,
  });
}

export function findUserWithAccountByEmail(
  email: string,
): Promise<FindUserWithAccountByEmailResult> {
  return prisma.user.findUnique({
    where: { email },
    select: findUserWithAccountByEmailArgs.select,
  });
}

export function updateRefreshToken(
  userId: number,
  refreshToken: string | null,
): Promise<UpdateRefreshTokenResult> {
  return prisma.account.update({
    where: { userId },
    data: { refreshToken },
    select: updateRefreshTokenArgs.select,
  });
}

export function findUserWithAccountById(
  userId: number,
): Promise<FindUserWithAccountByIdResult> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: findUserWithAccountByIdArgs.select,
  });
}

export function findTokenOwnerStatus(userId: number) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { isActive: true, tokenVersion: true },
  });
}

export function createUserWithInvitation({
  invitationToken,
  name,
  email,
  passwordHash,
}: CreateUserWithInvitationParams): Promise<CreateUserWithInvitationResult | null> {
  const hashedToken = hashToken(invitationToken);

  return prisma.$transaction(async (tx) => {
    const updateResult = await tx.invitation.updateMany({
      where: {
        token: hashedToken,
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });

    if (updateResult.count === 0) {
      return null;
    }

    const invitation = await tx.invitation.findUnique({
      where: { token: hashedToken },
      select: {
        role: true,
        organizationId: true,
      },
    });

    if (!invitation) {
      return null;
    }

    const user = await tx.user.create({
      data: {
        name,
        email,
        role: invitation.role,
        organizationId: invitation.organizationId,
        account: {
          create: {
            password: passwordHash,
          },
        },
      },
      select: createUserWithInvitationArgs.select,
    });

    return user;
  });
}

export function findUserByEmailForReset(
  email: string,
): Promise<FindUserByEmailForResetResult> {
  return prisma.user.findUnique({
    where: { email },
    select: findUserByEmailForResetArgs.select,
  });
}

export function setResetPasswordToken(
  userId: number,
  resetPasswordToken: string | null,
  resetPasswordTokenExpiresAt: Date | null,
): Promise<UpdateRefreshTokenResult> {
  return prisma.account.update({
    where: { userId },
    data: { resetPasswordToken, resetPasswordTokenExpiresAt },
    select: updateRefreshTokenArgs.select,
  });
}

export function resetPassword(
  resetPasswordToken: string,
  passwordHash: string,
): Promise<FindUserByResetTokenResult> {
  const hashedToken = hashToken(resetPasswordToken);

  return prisma.$transaction(async (tx) => {
    const account = await tx.account.findUnique({
      where: { resetPasswordToken: hashedToken },
      select: { userId: true, resetPasswordTokenExpiresAt: true },
    });

    if (
      !account ||
      !account.resetPasswordTokenExpiresAt ||
      account.resetPasswordTokenExpiresAt < new Date()
    ) {
      return null;
    }

    await tx.account.update({
      where: { userId: account.userId },
      data: {
        password: passwordHash,
        refreshToken: null,
        resetPasswordToken: null,
        resetPasswordTokenExpiresAt: null,
      },
    });

    return tx.user.update({
      where: { id: account.userId },
      data: { tokenVersion: { increment: 1 } },
      select: findUserByResetTokenArgs.select,
    });
  });
}
