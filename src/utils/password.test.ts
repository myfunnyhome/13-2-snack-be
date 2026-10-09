import bcrypt from 'bcrypt';

import {
  DUMMY_PASSWORD_HASH,
  createPasswordHash,
  isPasswordMatched,
} from './password';

describe('비밀번호 해싱과 비교', () => {
  test('해시한 비밀번호는 원래 비밀번호와만 일치한다', async () => {
    const hash = await createPasswordHash('Password123!');
    const isMatched = await isPasswordMatched('Password123!', hash);
    const isWrongMatched = await isPasswordMatched('wrong-password', hash);

    expect(hash).not.toBe('Password123!');
    expect(isMatched).toBe(true);
    expect(isWrongMatched).toBe(false);
  });

  test('더미 해시는 실제 해시와 같은 cost로 만들어져 비교 시간이 비슷하다', async () => {
    const hash = await createPasswordHash('Password123!');

    expect(bcrypt.getRounds(DUMMY_PASSWORD_HASH)).toBe(bcrypt.getRounds(hash));
  });
});
