import { prisma } from '../../config/prisma';
import { Prisma } from '../../generated/prisma/client';
import type { CreateInvitationInput } from './invitation.schema';

type CreateInvitationData = CreateInvitationInput & {
  organizationId: number;
  token: string;
  expiresAt: Date;
};

const findByTokenArgs = {
  select: {
    id: true,
    email: true,
    name: true,
    role: true,
    usedAt: true,
    expiresAt: true,
    organizationId: true,
    organization: {
      select: {
        id: true,
        name: true,
      },
    },
  },
} satisfies Prisma.InvitationDefaultArgs;

export type FindByTokenResult = Prisma.InvitationGetPayload<
  typeof findByTokenArgs
> | null;

const createArgs = {
  select: {
    id: true,
    email: true,
    name: true,
    role: true,
    usedAt: true,
    expiresAt: true,
    organizationId: true,
    organization: {
      select: {
        name: true,
      },
    },
  },
} satisfies Prisma.InvitationDefaultArgs;

export type CreateResult = Prisma.InvitationGetPayload<typeof createArgs>;

export function findByToken(token: string): Promise<FindByTokenResult> {
  return prisma.invitation.findUnique({
    where: { token },
    select: findByTokenArgs.select,
  });
}

export function create({
  email,
  name,
  role,
  organizationId,
  token,
  expiresAt,
}: CreateInvitationData): Promise<CreateResult> {
  return prisma.invitation.create({
    data: {
      email,
      name,
      role,
      organizationId,
      token,
      expiresAt,
    },
    select: createArgs.select,
  });
}
