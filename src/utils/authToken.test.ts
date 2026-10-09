import { isTokenRevoked } from './authToken';

describe('토큰 무효화 판단 (isTokenRevoked)', () => {
  test('토큰 버전과 DB 버전이 같고 활성 계정이면 유효하다', () => {
    expect(isTokenRevoked(0, { isActive: true, tokenVersion: 0 })).toBe(false);
  });

  test('권한 변경·비밀번호 변경으로 DB 버전이 올라가면 무효다', () => {
    expect(isTokenRevoked(0, { isActive: true, tokenVersion: 1 })).toBe(true);
  });

  test('탈퇴(비활성) 계정의 토큰은 무효다', () => {
    expect(isTokenRevoked(1, { isActive: false, tokenVersion: 1 })).toBe(true);
  });

  test('버전이 없는 기존 토큰은 무효다', () => {
    expect(isTokenRevoked(undefined, { isActive: true, tokenVersion: 0 })).toBe(
      true,
    );
  });

  test('사용자를 찾을 수 없으면 무효다', () => {
    expect(isTokenRevoked(0, null)).toBe(true);
  });
});
