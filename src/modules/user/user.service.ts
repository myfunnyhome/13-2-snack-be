import { Role } from '../../generated/prisma/client';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../types/errors';
import * as userRepository from './user.repository';
import type { UserListItem } from './user.repository';
import type { ChangeRoleInput, SearchUsersInput } from './user.schema';

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
