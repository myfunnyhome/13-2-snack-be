import { updateProfileSchema } from './user.schema';

describe('내 정보 수정 요청 검증 (updateProfileSchema)', () => {
  test('비밀번호를 바꿀 때 currentPassword가 없으면 실패한다', () => {
    const result = updateProfileSchema.safeParse({
      password: 'newpassword123',
      passwordConfirm: 'newpassword123',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path[0]).toBe('currentPassword');
  });

  test('비밀번호를 바꿀 때 currentPassword가 있으면 통과한다', () => {
    const result = updateProfileSchema.safeParse({
      currentPassword: 'Password123!',
      password: 'newpassword123',
      passwordConfirm: 'newpassword123',
    });

    expect(result.success).toBe(true);
  });

  test('회사명만 바꿀 때는 currentPassword 없이 통과한다', () => {
    const result = updateProfileSchema.safeParse({
      organizationName: '새스낵컴퍼니',
    });

    expect(result.success).toBe(true);
  });
});
