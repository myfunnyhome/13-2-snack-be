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

// 같은 조직이 같은 이메일로 보낸 아직 유효한 초대는 새 초대를 만들면서 함께 만료시킨다.
// 재발송하면 이전 메일의 링크가 더 이상 쓰이지 않게 하기 위함이고,
// 새 초대 생성과 이전 초대 만료는 하나의 트랜잭션으로 처리한다.
export function create({
  email,
  name,
  role,
  organizationId,
  token,
  expiresAt,
}: CreateInvitationData): Promise<CreateResult> {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    await tx.invitation.updateMany({
      where: {
        email,
        organizationId,
        usedAt: null,
        expiresAt: { gt: now },
      },
      data: { expiresAt: now },
    });

    return tx.invitation.create({
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
  });
}
