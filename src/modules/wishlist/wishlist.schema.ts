import { z } from 'zod';

export const wishlistProductIdParamsSchema = z.object({
  productId: z.coerce
    .number({ error: '올바른 상품 ID가 아닙니다.' })
    .int({ error: '올바른 상품 ID가 아닙니다.' })
    .positive({ error: '올바른 상품 ID가 아닙니다.' }),
});

export const wishlistListQuerySchema = z.object({
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
    .default(6),
});

export const batchDeleteWishlistBodySchema = z.object({
  productIds: z
    .array(
      z.coerce
        .number({ error: 'productIds는 숫자 배열이어야 합니다.' })
        .int({ error: 'productIds는 정수 배열이어야 합니다.' })
        .positive({ error: 'productIds는 양수여야 합니다.' }),
      {
        error: (issue) =>
          issue.input === undefined
            ? 'productIds는 필수입니다.'
            : 'productIds는 배열이어야 합니다.',
      },
    )
    .min(1, { error: 'productIds는 1개 이상이어야 합니다.' }),
});


export type WishlistProductIdParams = z.infer<
  typeof wishlistProductIdParamsSchema
>;
export type WishlistListQuery = z.infer<typeof wishlistListQuerySchema>;
export type BatchDeleteWishlistBody = z.infer<
  typeof batchDeleteWishlistBodySchema
>;
