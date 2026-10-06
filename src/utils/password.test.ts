import { createPasswordHash, isPasswordMatched } from './password';

describe('비밀번호 해싱과 비교', () => {
  test('해시한 비밀번호는 원래 비밀번호와만 일치한다', async () => {
    const hash = await createPasswordHash('Password123!');
    const isMatched = await isPasswordMatched('Password123!', hash);
    const isWrongMatched = await isPasswordMatched('wrong-password', hash);

    expect(hash).not.toBe('Password123!');
    expect(isMatched).toBe(true);
    expect(isWrongMatched).toBe(false);
  });
});
