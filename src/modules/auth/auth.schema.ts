import { z } from 'zod';

export const superAdminSignupSchema = z
  .object(
    {
      name: z
        .string('이름은 필수 값입니다.')
        .trim()
        .min(1, '이름은 1자 이상이어야 합니다.'),

      email: z
        .string('이메일은 필수 값입니다.')
        .trim()
        .max(254, '이메일은 254자 이하여야 합니다.')
        .pipe(z.email('올바른 이메일 형식이 아닙니다.')),

      password: z
        .string('비밀번호는 필수 값입니다.')
        .trim()
        .min(8, '비밀번호는 8자 이상이어야 합니다.')
        .max(64, '비밀번호는 64자 이하여야 합니다.'),

      passwordConfirm: z.string('비밀번호 확인은 필수 값입니다.').trim(),

      organizationName: z
        .string('회사명은 필수 값입니다.')
        .trim()
        .min(1, '회사명은 1자 이상이어야 합니다.'),
    },
    {
      message: '요청 본문이 올바르지 않습니다.',
    },
  )
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

export type SuperAdminSignupInput = z.infer<typeof superAdminSignupSchema>;

export const signinSchema = z.object(
  {
    email: z
      .string('이메일은 필수 값입니다.')
      .trim()
      .pipe(z.email('올바른 이메일 형식이 아닙니다.')),

    password: z
      .string('비밀번호는 필수 값입니다.')
      .min(1, '비밀번호를 입력해주세요.'),
  },
  {
    message: '요청 본문이 올바르지 않습니다.',
  },
);

export type SigninInput = z.infer<typeof signinSchema>;
