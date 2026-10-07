import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const DUMMY_PASSWORD_HASH =
  '$2b$10$pOLVgtOetYB6B38zglYnz.jIDsFJVP2gUEeYRs3M5xTNvTkw6fdm6';

export async function createPasswordHash(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function isPasswordMatched(
  inputPassword: string,
  savedPasswordHash: string,
): Promise<boolean> {
  return bcrypt.compare(inputPassword, savedPasswordHash);
}
