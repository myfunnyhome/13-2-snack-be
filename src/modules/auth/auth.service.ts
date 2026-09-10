import type { Role } from '../../generated/prisma/client';
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from '../../types/errors';
import {
  type TokenPayload,
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
} from '../../utils/authToken';
import { createPasswordHash, isPasswordMatched } from '../../utils/password';
import * as invitationService from '../invitation/invitation.service';
import * as authRepository from './auth.repository';
import type {
  InvitationSignupInput,
  SigninInput,
  SuperAdminSignupInput,
} from './auth.schema';

type SuperAdminSignupResult = {
  organization: { id: number; name: string };
  user: { id: number; name: string; email: string; role: 'SUPER_ADMIN' };
};

type InvitationSignupResult = {
  organization: { id: number; name: string };
  user: {
    id: number;
    name: string;
    email: string;
    role: Role;
  };
};

type SigninUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  organizationId: number;
};

type SigninResult = {
  user: SigninUser;
  accessToken: string;
  refreshToken: string;
};

type RefreshResult = {
  accessToken: string;
  refreshToken: string;
};

export async function signupSuperAdmin(
  data: SuperAdminSignupInput,
): Promise<SuperAdminSignupResult> {
  const existingUser = await authRepository.findUserByEmail(data.email);
  if (existingUser) {
    throw new ConflictError('이미 사용 중인 이메일입니다.');
  }

  const passwordHash = await createPasswordHash(data.password);

  const organization = await authRepository.createSuperAdmin({
    name: data.name,
    email: data.email,
    passwordHash,
    organizationName: data.organizationName,
    bizRegNumber: data.bizRegNumber,
  });

  const user = organization.users[0];

  if (!user || user.role !== 'SUPER_ADMIN') {
    throw new Error('최고관리자 생성에 실패했습니다.');
  }

  return {
    organization: { id: organization.id, name: organization.name },
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'SUPER_ADMIN',
    },
  };
}

export async function signupWithInvitation(
  data: InvitationSignupInput,
): Promise<InvitationSignupResult> {
  const invitation = await invitationService.getById(data.invitationId);

  if (invitation.email !== data.email) {
    throw new BadRequestError(
      '초대받은 이메일과 가입 이메일이 일치하지 않습니다.',
    );
  }

  const existingUser = await authRepository.findUserByEmail(data.email);
  if (existingUser) {
    throw new ConflictError('이미 사용 중인 이메일입니다.');
  }

  const passwordHash = await createPasswordHash(data.password);

  const user = await authRepository.createUserWithInvitation({
    invitationId: data.invitationId,
    name: data.name,
    email: data.email,
    passwordHash,
  });

  if (!user) {
    throw new BadRequestError('이미 사용된 초대입니다.');
  }

  return {
    organization: {
      id: user.organization.id,
      name: user.organization.name,
    },
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function signin(data: SigninInput): Promise<SigninResult> {
  const user = await authRepository.findUserWithAccountByEmail(data.email);

  if (!user?.account) {
    throw new UnauthorizedError('이메일 또는 비밀번호가 일치하지 않습니다.');
  }

  const isMatched = await isPasswordMatched(
    data.password,
    user.account.password,
  );
  if (!isMatched) {
    throw new UnauthorizedError('이메일 또는 비밀번호가 일치하지 않습니다.');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('비활성화된 계정입니다.', 'ACCOUNT_INACTIVE');
  }

  const tokenPayload: TokenPayload = {
    userId: user.id,
    organizationId: user.organizationId,
    role: user.role,
  };

  const accessToken = createAccessToken(tokenPayload);
  const refreshToken = createRefreshToken(tokenPayload);

  const hashedRefreshToken = hashRefreshToken(refreshToken);
  await authRepository.updateRefreshToken(user.id, hashedRefreshToken);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    },
    accessToken,
    refreshToken,
  };
}

export async function refresh(
  refreshToken: string,
  userId: number,
): Promise<RefreshResult> {
  const user = await authRepository.findUserWithAccountById(userId);
  if (!user?.account?.refreshToken) {
    throw new UnauthorizedError();
  }

  if (!user.isActive) {
    throw new UnauthorizedError('비활성화된 계정입니다.', 'ACCOUNT_INACTIVE');
  }

  if (hashRefreshToken(refreshToken) !== user.account.refreshToken) {
    throw new UnauthorizedError();
  }

  const tokenPayload: TokenPayload = {
    userId: user.id,
    role: user.role,
    organizationId: user.organizationId,
  };

  const newAccessToken = createAccessToken(tokenPayload);
  const newRefreshToken = createRefreshToken(tokenPayload);

  await authRepository.updateRefreshToken(
    user.id,
    hashRefreshToken(newRefreshToken),
  );

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function signout(userId: number): Promise<void> {
  await authRepository.updateRefreshToken(userId, null);
}
