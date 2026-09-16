import crypto from 'node:crypto';

import jwt, { SignOptions } from 'jsonwebtoken';

import { Role } from '../generated/prisma/client';

export type TokenType = 'access' | 'refresh';

export type TokenPayload = {
  userId: number;
  organizationId: number;
  role: Role;
};

function getTokenSecret(type: TokenType): string {
  const secret =
    type === 'access'
      ? process.env.JWT_ACCESS_SECRET
      : process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error(`${type} token secret이 설정되지 않았습니다.`);
  }

  return secret;
}

function getTokenExpiresIn(
  type: TokenType,
): NonNullable<SignOptions['expiresIn']> {
  const expiresIn =
    type === 'access'
      ? (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m')
      : (process.env.JWT_REFRESH_EXPIRES_IN ?? '3d');

  return expiresIn as NonNullable<SignOptions['expiresIn']>;
}

function createToken(payload: TokenPayload, type: TokenType): string {
  return jwt.sign({ ...payload, type }, getTokenSecret(type), {
    expiresIn: getTokenExpiresIn(type),
    algorithm: 'HS256',
  });
}

export function createAccessToken(payload: TokenPayload): string {
  return createToken(payload, 'access');
}

export function createRefreshToken(payload: TokenPayload): string {
  return createToken(payload, 'refresh');
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
