import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function createPasswordHash(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function isPasswordMatched(
  inputPassword: string,
  savedPasswordHash: string,
): Promise<boolean> {
  return bcrypt.compare(inputPassword, savedPasswordHash);
}
