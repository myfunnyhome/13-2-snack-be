import { Role } from '../../generated/prisma/client';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../../types/errors';
import { createPasswordHash } from '../../utils/password';
import * as userRepository from './user.repository';
import type { UserListItem } from './user.repository';
import type {
  ChangeRoleInput,
  SearchUsersInput,
  UpdateProfileInput,
} from './user.schema';

type SearchUsersParams = SearchUsersInput & {
  organizationId: number;
};

type SearchUsersResult = {
  users: UserListItem[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
};

type ChangeRoleParams = ChangeRoleInput & {
  targetUserId: number;
  requesterId: number;
  organizationId: number;
};

type DeactivateParams = {
  targetUserId: number;
  requesterId: number;
  organizationId: number;
};

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

async function assertTargetInOrganization(
  targetUserId: number,
  requesterId: number,
  organizationId: number,
): Promise<void> {
  if (targetUserId === requesterId) {
    throw new BadRequestError('자기 자신은 대상으로 지정할 수 없습니다.');
  }

  const target = await userRepository.findTargetById(targetUserId);

  if (!target || target.organizationId !== organizationId) {
    throw new NotFoundError('회원을 찾을 수 없습니다.');
  }

  if (target.role === Role.SUPER_ADMIN) {
    throw new ForbiddenError('최고관리자는 변경할 수 없습니다.');
  }

  if (!target.isActive) {
    throw new BadRequestError('이미 탈퇴 처리된 회원입니다.');
  }
}

export async function searchUsers({
  organizationId,
  keyword,
  page,
  limit,
}: SearchUsersParams): Promise<SearchUsersResult> {
  const [users, totalCount] = await userRepository.findManyByOrganization({
    organizationId,
    keyword,
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    users,
    page,
    limit,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };
}

export async function changeRole({
  targetUserId,
  requesterId,
  organizationId,
  role,
}: ChangeRoleParams): Promise<UserListItem> {
  await assertTargetInOrganization(targetUserId, requesterId, organizationId);

  return userRepository.updateRole(targetUserId, role);
}

export async function deactivateUser({
  targetUserId,
  requesterId,
  organizationId,
}: DeactivateParams): Promise<UserListItem> {
  await assertTargetInOrganization(targetUserId, requesterId, organizationId);

  return userRepository.deactivate(targetUserId);
}

export async function getProfile(userId: number): Promise<MeProfile> {
  const user = await userRepository.findProfileById(userId);

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

  const current = await userRepository.findProfileById(userId);

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

  const user = await userRepository.updateProfile({
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
