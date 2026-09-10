import { prisma } from '../../config/prisma';
import { Prisma } from '../../generated/prisma/client';
import type { CreateInvitationInput } from './invitation.schema';

type CreateInvitationData = CreateInvitationInput & {
  organizationId: number;
  expiresAt: Date;
};

const findByIdArgs = {
  select: {
    id: true,
    email: true,
    name: true,
    role: true,
    used: true,
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

export type FindByIdResult = Prisma.InvitationGetPayload<
  typeof findByIdArgs
> | null;

const createArgs = {
  select: {
    id: true,
    email: true,
    name: true,
    role: true,
    used: true,
    expiresAt: true,
    organizationId: true,
  },
} satisfies Prisma.InvitationDefaultArgs;

export type CreateResult = Prisma.InvitationGetPayload<typeof createArgs>;

export function findById(id: string): Promise<FindByIdResult> {
  return prisma.invitation.findUnique({
    where: { id },
    select: findByIdArgs.select,
  });
}

export function create({
  email,
  name,
  role,
  organizationId,
  expiresAt,
}: CreateInvitationData): Promise<CreateResult> {
  return prisma.invitation.create({
    data: {
      email,
      name,
      role,
      organizationId,
      expiresAt,
    },
    select: createArgs.select,
  });
}
