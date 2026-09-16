import { prisma } from '../../config/prisma';
import { Prisma, Role } from '../../generated/prisma/client';

type FindManyParams = {
  organizationId: number;
  keyword?: string;
  skip: number;
  take: number;
};

const userListArgs = {
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
  },
} satisfies Prisma.UserDefaultArgs;

export type UserListItem = Prisma.UserGetPayload<typeof userListArgs>;

const findTargetArgs = {
  select: {
    id: true,
    role: true,
    isActive: true,
    organizationId: true,
  },
} satisfies Prisma.UserDefaultArgs;

export type FindTargetResult = Prisma.UserGetPayload<
  typeof findTargetArgs
> | null;

const findProfileByIdArgs = {
  select: {
    name: true,
    email: true,
    role: true,
    isActive: true,
    organization: {
      select: {
        name: true,
      },
    },
  },
} satisfies Prisma.UserDefaultArgs;

export type FindProfileByIdResult = Prisma.UserGetPayload<
  typeof findProfileByIdArgs
> | null;

const findInviterInfoArgs = {
  select: {
    name: true,
    organization: {
      select: {
        name: true,
      },
    },
  },
} satisfies Prisma.UserDefaultArgs;

export type FindInviterInfoResult = Prisma.UserGetPayload<
  typeof findInviterInfoArgs
> | null;

type UpdateProfileParams = {
  userId: number;
  organizationId: number;
  passwordHash?: string;
  organizationName?: string;
};

function buildWhere(organizationId: number, keyword?: string) {
  return {
    organizationId,
    isActive: true,
    role: { in: [Role.GENERAL, Role.ADMIN] },
    ...(keyword ? { name: { contains: keyword } } : {}),
  };
}

export function findManyByOrganization({
  organizationId,
  keyword,
  skip,
  take,
}: FindManyParams): Promise<[UserListItem[], number]> {
  const where = buildWhere(organizationId, keyword);

  return Promise.all([
    prisma.user.findMany({
      where,
      select: userListArgs.select,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.user.count({ where }),
  ]);
}

export function findTargetById(userId: number): Promise<FindTargetResult> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: findTargetArgs.select,
  });
}

export function updateRole(userId: number, role: Role): Promise<UserListItem> {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: userListArgs.select,
  });
}

export function deactivate(userId: number): Promise<UserListItem> {
  return prisma.$transaction(async (tx) => {
    await tx.account.updateMany({
      where: { userId },
      data: { refreshToken: null },
    });

    return await tx.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: userListArgs.select,
    });
  });
}

export function findProfileById(
  userId: number,
): Promise<FindProfileByIdResult> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: findProfileByIdArgs.select,
  });
}

export function updateProfile({
  userId,
  organizationId,
  passwordHash,
  organizationName,
}: UpdateProfileParams): Promise<FindProfileByIdResult> {
  return prisma.$transaction(async (tx) => {
    if (passwordHash !== undefined) {
      await tx.account.update({
        where: { userId },
        data: { password: passwordHash },
      });
    }

    if (organizationName !== undefined) {
      await tx.organization.update({
        where: { id: organizationId },
        data: { name: organizationName },
      });
    }

    return await tx.user.findUnique({
      where: { id: userId },
      select: findProfileByIdArgs.select,
    });
  });
}

export function findInviterInfo(
  userId: number,
): Promise<FindInviterInfoResult> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: findInviterInfoArgs.select,
  });
}
