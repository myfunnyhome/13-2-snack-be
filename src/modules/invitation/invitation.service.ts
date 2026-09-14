import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../../types/errors';
import { sendInvitationEmail } from '../../utils/mailer';
import { generateToken, hashToken } from '../../utils/token';
import * as userRepository from '../user/user.repository';
import * as invitationRepository from './invitation.repository';
import type { CreateResult, FindByTokenResult } from './invitation.repository';
import type { CreateInvitationInput } from './invitation.schema';

const INVITATION_EXPIRES_IN_DAYS = 7;

type CreateInvitationParams = CreateInvitationInput & {
  organizationId: number;
  requesterId: number;
};

export async function getByToken(
  token: string,
): Promise<NonNullable<FindByTokenResult>> {
  const hashedToken = hashToken(token);
  const invitation = await invitationRepository.findByToken(hashedToken);

  if (!invitation) {
    throw new NotFoundError('초대 정보를 찾을 수 없습니다.');
  }

  if (invitation.usedAt !== null) {
    throw new ConflictError('이미 사용된 초대입니다.');
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
  requesterId,
}: CreateInvitationParams): Promise<CreateResult> {
  const inviter = await userRepository.findInviterInfo(requesterId);

  if (!inviter) {
    throw new NotFoundError('요청자 정보를 찾을 수 없습니다.');
  }

  const token = generateToken();
  const hashedToken = hashToken(token);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRES_IN_DAYS);

  await sendInvitationEmail({
    to: email,
    name,
    organizationName: inviter.organization.name,
    inviterName: inviter.name,
    token,
  });

  return invitationRepository.create({
    email,
    name,
    role,
    organizationId,
    token: hashedToken,
    expiresAt,
  });
}
