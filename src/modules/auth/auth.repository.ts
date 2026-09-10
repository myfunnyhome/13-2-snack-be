import { prisma } from '../../config/prisma';
import { Prisma } from '../../generated/prisma/client';

type CreateSuperAdminParams = {
  name: string;
  email: string;
  passwordHash: string;
  organizationName: string;
  bizRegNumber: string;
};

type CreateUserWithInvitationParams = {
  invitationId: string;
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
  bizRegNumber,
}: CreateSuperAdminParams): Promise<CreateSuperAdminResult> {
  return prisma.organization.create({
    data: {
      name: organizationName,
      bizRegNumber,
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

export function createUserWithInvitation({
  invitationId,
  name,
  email,
  passwordHash,
}: CreateUserWithInvitationParams): Promise<CreateUserWithInvitationResult | null> {
  return prisma.$transaction(async (tx) => {
    const invitation = await tx.invitation.findUnique({
      where: { id: invitationId },
      select: {
        id: true,
        role: true,
        organizationId: true,
      },
    });

    if (!invitation) {
      return null;
    }

    const updateResult = await tx.invitation.updateMany({
      where: {
        id: invitationId,
        used: false,
      },
      data: { used: true },
    });

    if (updateResult.count === 0) {
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
