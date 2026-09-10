import type { Role } from '../../generated/prisma/client';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../../types/errors';
import { createPasswordHash } from '../../utils/password';
import * as meRepository from './me.repository';
import type { UpdateProfileInput } from './me.schema';

type MeProfile = {
  name: string;
  email: string;
  role: Role;
  organization: { name: string };
};

type UpdateProfileParams = UpdateProfileInput & {
  userId: number;
  role: Role;
  organizationId: number;
};

export async function getProfile(userId: number): Promise<MeProfile> {
  const user = await meRepository.findProfileById(userId);

  if (!user) {
    throw new NotFoundError('사용자를 찾을 수 없습니다.');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('비활성화된 계정입니다.', 'ACCOUNT_INACTIVE');
  }

  return {
    name: user.name,
    email: user.email,
    role: user.role,
    organization: { name: user.organization.name },
  };
}

export async function updateProfile({
  userId,
  role,
  organizationId,
  password,
  organizationName,
}: UpdateProfileParams): Promise<MeProfile> {
  if (password === undefined && organizationName === undefined) {
    throw new BadRequestError('변경할 항목이 없습니다.');
  }

  const current = await meRepository.findProfileById(userId);

  if (!current) {
    throw new NotFoundError('사용자를 찾을 수 없습니다.');
  }

  if (!current.isActive) {
    throw new UnauthorizedError('비활성화된 계정입니다.', 'ACCOUNT_INACTIVE');
  }

  if (organizationName !== undefined && role !== 'SUPER_ADMIN') {
    throw new ForbiddenError('회사명은 최고관리자만 변경할 수 있습니다.');
  }

  const passwordHash =
    password === undefined ? undefined : await createPasswordHash(password);

  const user = await meRepository.updateProfile({
    userId,
    organizationId,
    passwordHash,
    organizationName,
  });

  if (!user) {
    throw new NotFoundError('사용자를 찾을 수 없습니다.');
  }

  return {
    name: user.name,
    email: user.email,
    role: user.role,
    organization: { name: user.organization.name },
  };
}
