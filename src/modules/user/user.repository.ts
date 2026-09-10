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
