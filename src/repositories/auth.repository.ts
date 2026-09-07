import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

type CreateSuperAdminParams = {
  name: string;
  email: string;
  passwordHash: string;
  organizationName: string;
};

const findUserWithAccountByEmailArgs = {
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
    isActive: true,
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

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function createSuperAdmin({
  name,
  email,
  passwordHash,
  organizationName,
}: CreateSuperAdminParams): Promise<CreateSuperAdminResult> {
  return prisma.organization.create({
    data: {
      name: organizationName,
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
