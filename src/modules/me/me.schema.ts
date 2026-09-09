import { z } from 'zod';

export const updateProfileSchema = z
  .object(
    {
      organizationName: z
        .string({ error: '회사명은 문자열이어야 합니다.' })
        .trim()
        .min(1, { error: '회사명은 1자 이상이어야 합니다.' })
        .optional(),

      password: z
        .string({ error: '비밀번호는 문자열이어야 합니다.' })
        .trim()
        .min(8, { error: '비밀번호는 8자 이상이어야 합니다.' })
        .max(64, { error: '비밀번호는 64자 이하여야 합니다.' })
        .optional(),

      passwordConfirm: z
        .string({ error: '비밀번호 확인은 문자열이어야 합니다.' })
        .trim()
        .optional(),
    },
    { error: '요청 본문이 올바르지 않습니다.' },
  )
  .refine(
    (data) =>
      data.password === undefined || data.password === data.passwordConfirm,
    {
      error: '비밀번호가 일치하지 않습니다.',
      path: ['passwordConfirm'],
    },
  );

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
