import { BadRequestError, NotFoundError } from '../../types/errors';
import * as invitationRepository from './invitation.repository';
import type { CreateResult, FindByIdResult } from './invitation.repository';
import type { CreateInvitationInput } from './invitation.schema';

const INVITATION_EXPIRES_IN_DAYS = 7;

type CreateInvitationParams = CreateInvitationInput & {
  organizationId: number;
};

export async function getById(
  id: string,
): Promise<NonNullable<FindByIdResult>> {
  const invitation = await invitationRepository.findById(id);

  if (!invitation) {
    throw new NotFoundError('초대 정보를 찾을 수 없습니다.');
  }

  if (invitation.used) {
    throw new BadRequestError('이미 사용된 초대입니다.');
  }

  if (invitation.expiresAt < new Date()) {
    throw new BadRequestError('만료된 초대입니다.');
  }

  return invitation;
}

export async function create({
  email,
  name,
  role,
  organizationId,
}: CreateInvitationParams): Promise<CreateResult> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRES_IN_DAYS);

  return invitationRepository.create({
    email,
    name,
    role,
    organizationId,
    expiresAt,
  });
}
