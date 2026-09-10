import { z } from 'zod';

import { Role } from '../../generated/prisma/client';

export const userIdParamsSchema = z.object({
  id: z.coerce
    .number({ error: '올바른 회원 ID가 아닙니다.' })
    .int({ error: '올바른 회원 ID가 아닙니다.' })
    .positive({ error: '올바른 회원 ID가 아닙니다.' }),
});

export const searchUsersSchema = z.object({
  keyword: z.string().trim().optional(),

  page: z.coerce
    .number({ error: 'page는 숫자여야 합니다.' })
    .int({ error: 'page는 정수여야 합니다.' })
    .min(1, { error: 'page는 1 이상이어야 합니다.' })
    .default(1),

  limit: z.coerce
    .number({ error: 'limit은 숫자여야 합니다.' })
    .int({ error: 'limit은 정수여야 합니다.' })
    .min(1, { error: 'limit은 1 이상이어야 합니다.' })
    .max(100, { error: 'limit은 100 이하여야 합니다.' })
    .default(10),
});

export const changeRoleSchema = z.object(
  {
    role: z.enum([Role.GENERAL, Role.ADMIN], {
      error: '권한은 GENERAL 또는 ADMIN만 가능합니다.',
    }),
  },
  { error: '요청 본문이 올바르지 않습니다.' },
);

export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;
