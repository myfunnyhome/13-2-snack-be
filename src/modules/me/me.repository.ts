import { prisma } from '../../config/prisma';
import { Prisma } from '../../generated/prisma/client';

type UpdateProfileParams = {
  userId: number;
  organizationId: number;
  passwordHash?: string;
  organizationName?: string;
};

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
