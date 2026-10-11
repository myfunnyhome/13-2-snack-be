import { z } from 'zod';

export const snackyQuestionBodySchema = z.object({
  question: z
    .string({ error: '질문은 문자열이어야 합니다.' })
    .trim()
    .min(1, '질문을 입력해주세요.'),
});

export type SnackyQuestionBody = z.infer<typeof snackyQuestionBodySchema>;
