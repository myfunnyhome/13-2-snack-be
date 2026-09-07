import type { Role } from '../generated/prisma/client';
import * as authRepository from '../repositories/auth.repository';
import type {
  SigninInput,
  SuperAdminSignupInput,
} from '../schemas/auth.schema';
import { ConflictError, UnauthorizedError } from '../types/errors';
import {
  type TokenPayload,
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
} from '../utils/authToken';
import { createPasswordHash, isPasswordMatched } from '../utils/password';

type SuperAdminSignupResult = {
  organization: { id: number; name: string };
  user: { id: number; name: string; email: string; role: 'SUPER_ADMIN' };
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
    throw new UnauthorizedError('비활성화된 계정입니다.');
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
