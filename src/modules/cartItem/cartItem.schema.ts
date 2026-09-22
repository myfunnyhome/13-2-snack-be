import { z } from 'zod';

export const MAX_CART_ITEM_QUANTITY = 999;

const idParamSchema = z.coerce
  .number({ error: '유효한 id가 아닙니다.' })
  .int({ error: 'id는 정수여야 합니다.' })
  .positive({ error: 'id는 양수여야 합니다.' });

const quantitySchema = z.coerce
  .number({ error: '수량은 숫자여야 합니다.' })
  .int({ error: '수량은 정수여야 합니다.' })
  .min(1, { error: '수량은 1 이상이어야 합니다.' })
  .max(MAX_CART_ITEM_QUANTITY, {
    error: `수량은 ${MAX_CART_ITEM_QUANTITY} 이하여야 합니다.`,
  });

export const cartItemIdParamsSchema = z.object({
  id: idParamSchema,
});

export const addCartItemBodySchema = z.object(
  {
    productId: z.coerce
      .number({ error: 'productId는 숫자여야 합니다.' })
      .int({ error: 'productId는 정수여야 합니다.' })
      .positive({ error: 'productId는 양수여야 합니다.' }),
    quantity: quantitySchema.default(1),
  },
  { error: '요청 본문이 올바르지 않습니다.' },
);

export const updateCartItemBodySchema = z.object(
  {
    quantity: quantitySchema,
  },
  { error: '요청 본문이 올바르지 않습니다.' },
);

export type CartItemIdParams = z.infer<typeof cartItemIdParamsSchema>;
export type AddCartItemBody = z.infer<typeof addCartItemBodySchema>;
export type UpdateCartItemBody = z.infer<typeof updateCartItemBodySchema>;
