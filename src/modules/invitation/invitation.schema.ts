import { z } from 'zod';

import { Role } from '../../generated/prisma/client';

export const invitationIdParamsSchema = z.object({
  id: z.string({ error: '초대 ID가 필요합니다.' }).min(1, {
    error: '초대 ID가 필요합니다.',
  }),
});

export const createInvitationSchema = z.object({
  email: z
    .string({ error: '이메일은 필수 값입니다.' })
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: '올바른 이메일 형식이 아닙니다.' })),

  name: z
    .string({ error: '이름은 필수 값입니다.' })
    .trim()
    .min(1, { error: '이름은 1자 이상이어야 합니다.' }),

  role: z.enum([Role.GENERAL, Role.ADMIN], {
    error: '초대 권한은 GENERAL 또는 ADMIN만 가능합니다.',
  }),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
