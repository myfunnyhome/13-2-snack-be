import { z } from 'zod';

export const superAdminSignupSchema = z
  .object(
    {
      name: z
        .string({ error: '이름은 필수 값입니다.' })
        .trim()
        .min(1, { error: '이름은 1자 이상이어야 합니다.' }),

      email: z
        .string({ error: '이메일은 필수 값입니다.' })
        .trim()
        .toLowerCase()
        .max(254, { error: '이메일은 254자 이하여야 합니다.' })
        .pipe(z.email({ error: '올바른 이메일 형식이 아닙니다.' })),

      password: z
        .string({ error: '비밀번호는 필수 값입니다.' })
        .trim()
        .min(8, { error: '비밀번호는 8자 이상이어야 합니다.' })
        .max(64, { error: '비밀번호는 64자 이하여야 합니다.' }),

      passwordConfirm: z
        .string({ error: '비밀번호 확인은 필수 값입니다.' })
        .trim(),

      organizationName: z
        .string({ error: '회사명은 필수 값입니다.' })
        .trim()
        .min(1, { error: '회사명은 1자 이상이어야 합니다.' }),

      bizRegNumber: z
        .string({ error: '사업자 번호는 필수 값입니다.' })
        .trim()
        .transform((value) => value.replace(/-/g, ''))
        .pipe(
          z.string().regex(/^\d{10}$/, {
            error: '사업자 번호는 숫자 10자리여야 합니다.',
          }),
        ),
    },
    {
      error: '요청 본문이 올바르지 않습니다.',
    },
  )
  .refine((data) => data.password === data.passwordConfirm, {
    error: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

export type SuperAdminSignupInput = z.infer<typeof superAdminSignupSchema>;

export const invitationSignupSchema = z
  .object(
    {
      invitationId: z
        .string({ error: '초대 ID는 필수 값입니다.' })
        .min(1, { error: '초대 ID는 필수 값입니다.' }),

      name: z
        .string({ error: '이름은 필수 값입니다.' })
        .trim()
        .min(1, { error: '이름은 1자 이상이어야 합니다.' }),

      email: z
        .string({ error: '이메일은 필수 값입니다.' })
        .trim()
        .toLowerCase()
        .max(254, { error: '이메일은 254자 이하여야 합니다.' })
        .pipe(z.email({ error: '올바른 이메일 형식이 아닙니다.' })),

      password: z
        .string({ error: '비밀번호는 필수 값입니다.' })
        .trim()
        .min(8, { error: '비밀번호는 8자 이상이어야 합니다.' })
        .max(64, { error: '비밀번호는 64자 이하여야 합니다.' }),

      passwordConfirm: z
        .string({ error: '비밀번호 확인은 필수 값입니다.' })
        .trim(),
    },
    {
      error: '요청 본문이 올바르지 않습니다.',
    },
  )
  .refine((data) => data.password === data.passwordConfirm, {
    error: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

export type InvitationSignupInput = z.infer<typeof invitationSignupSchema>;

export const signinSchema = z.object(
  {
    email: z
      .string({ error: '이메일은 필수 값입니다.' })
      .trim()
      .toLowerCase()
      .pipe(z.email({ error: '올바른 이메일 형식이 아닙니다.' })),

    password: z
      .string({ error: '비밀번호는 필수 값입니다.' })
      .min(1, { error: '비밀번호를 입력해주세요.' }),
  },
  {
    error: '요청 본문이 올바르지 않습니다.',
  },
);

export type SigninInput = z.infer<typeof signinSchema>;
