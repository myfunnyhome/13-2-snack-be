import { z } from 'zod';

import { OrderStatus } from '../../generated/prisma/client';

// ------------------------------
// 공통 조각
// ------------------------------

const idParamSchema = z.coerce
  .number({ message: '유효한 id가 아닙니다.' })
  .int('id는 정수여야 합니다.')
  .positive('id는 양수여야 합니다.');

const sortSchema = z
  .enum(['latest', 'lowPrice', 'highPrice'], {
    message: '정렬 기준이 올바르지 않습니다.',
  })
  .default('latest');

const paginationSchema = {
  page: z.coerce
    .number({ message: 'page는 숫자여야 합니다.' })
    .int('page는 정수여야 합니다.')
    .positive('page는 양수여야 합니다.')
    .default(1),
  limit: z.coerce
    .number({ message: 'limit은 숫자여야 합니다.' })
    .int('limit은 정수여야 합니다.')
    .positive('limit은 양수여야 합니다.')
    .default(6),
};

// ------------------------------
// POST /orders
// ------------------------------

export const createOrderBodySchema = z.object({
  items: z
    .array(
      z.object({
        cartItemId: z.coerce
          .number({ message: 'cartItemId는 숫자여야 합니다.' })
          .int('cartItemId는 정수여야 합니다.')
          .positive('cartItemId는 양수여야 합니다.'),
        quantity: z.coerce
          .number({ message: 'quantity는 숫자여야 합니다.' })
          .int('quantity는 정수여야 합니다.')
          .positive('quantity는 양수여야 합니다.'),
      }),
      {
        error: (issue) =>
          issue.input === undefined
            ? 'items는 필수입니다.'
            : 'items는 배열이어야 합니다.',
      },
    )
    .min(1, '주문할 항목이 최소 1개 이상이어야 합니다.'),
  requestMessage: z
    .string()
    .trim()
    .transform((val) => (val === '' ? undefined : val))
    .optional(),
});

export type CreateOrderBody = z.infer<typeof createOrderBodySchema>;

// ------------------------------
// :id 파라미터 (me/admin 공용)
// ------------------------------

export const orderIdParamsSchema = z.object({
  id: idParamSchema,
});

export type OrderIdParams = z.infer<typeof orderIdParamsSchema>;

// ------------------------------
// GET /me/orders
// ------------------------------

export const myOrderListQuerySchema = z.object({
  sort: sortSchema,
  ...paginationSchema,
});

export type MyOrderListQuery = z.infer<typeof myOrderListQuerySchema>;

// ------------------------------
// GET /admin/orders (me 스키마 확장)
// ------------------------------

export const orgOrderListQuerySchema = myOrderListQuerySchema.extend({
  status: z.enum([OrderStatus.PENDING, OrderStatus.APPROVED], {
    error: (issue) =>
      issue.input === undefined
        ? 'status는 필수입니다.'
        : 'status는 PENDING 또는 APPROVED여야 합니다.',
  }),
});

export type OrgOrderListQuery = z.infer<typeof orgOrderListQuerySchema>;

// ------------------------------
// PATCH /admin/orders/:id/approve, /reject (공용)
// ------------------------------

export const orderResponseMessageBodySchema = z.object({
  responseMessage: z
    .string({ message: 'responseMessage는 문자열이어야 합니다.' })
    .trim()
    .min(1, 'responseMessage는 필수입니다.'),
});

export type OrderResponseMessageBody = z.infer<
  typeof orderResponseMessageBodySchema
>;
