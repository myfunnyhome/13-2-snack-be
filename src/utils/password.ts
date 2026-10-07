import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// 존재하지 않는 계정으로 로그인할 때도 bcrypt 비교를 거쳐 응답 시간을 맞추기 위한 해시.
// 실제 비밀번호와 일치할 수 없는 임의 값을 SALT_ROUNDS와 같은 cost(10)로 해싱한 것이다.
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
