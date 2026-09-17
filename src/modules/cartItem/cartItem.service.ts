import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../types/errors';
import * as cartItemRepository from './cartItem.repository';
import {
  type AddCartItemBody,
  MAX_CART_ITEM_QUANTITY,
  type UpdateCartItemBody,
} from './cartItem.schema';

function toCartItem(cartItem: cartItemRepository.CartItemRecord) {
  return {
    id: cartItem.id,
    quantity: cartItem.quantity,
    productId: cartItem.productId,
    product: cartItem.product,
  };
}

// ------------------------------
// GET /me/cartItems
// ------------------------------

export async function getCartItems(userId: number) {
  const cartItems = await cartItemRepository.findManyByUserId(userId);
  return cartItems.map(toCartItem);
}

// ------------------------------
// POST /me/cartItems
// ------------------------------

export async function addCartItem(
  userId: number,
  organizationId: number,
  { productId, quantity }: AddCartItemBody,
) {
  const product = await cartItemRepository.findProduct(productId);

  if (!product || product.isDeleted) {
    throw new NotFoundError('상품을 찾을 수 없습니다.');
  }

  if (product.organizationId !== organizationId) {
    throw new ForbiddenError('다른 조직의 상품은 담을 수 없습니다.');
  }

  const existing = await cartItemRepository.findByUserAndProduct(
    userId,
    productId,
  );

  if (existing && existing.quantity + quantity > MAX_CART_ITEM_QUANTITY) {
    throw new BadRequestError(
      `수량은 ${MAX_CART_ITEM_QUANTITY} 이하여야 합니다.`,
    );
  }

  const result = await cartItemRepository.incrementQuantity(
    userId,
    productId,
    quantity,
  );

  if (result.quantity > MAX_CART_ITEM_QUANTITY) {
    return toCartItem(
      await cartItemRepository.updateQuantity(
        result.id,
        MAX_CART_ITEM_QUANTITY,
      ),
    );
  }

  return toCartItem(result);
}

// ------------------------------
// PATCH /me/cartItems/:id
// ------------------------------

export async function updateCartItem(
  userId: number,
  cartItemId: number,
  { quantity }: UpdateCartItemBody,
) {
  const cartItem = await ensureOwnedCartItem(userId, cartItemId);

  if (cartItem.product.isDeleted) {
    throw new BadRequestError('삭제된 상품은 수량을 변경할 수 없습니다.');
  }

  return toCartItem(
    await cartItemRepository.updateQuantity(cartItem.id, quantity),
  );
}

// ------------------------------
// DELETE /me/cartItems/:id
// ------------------------------

export async function removeCartItem(userId: number, cartItemId: number) {
  const cartItem = await ensureOwnedCartItem(userId, cartItemId);

  return toCartItem(await cartItemRepository.remove(cartItem.id));
}

async function ensureOwnedCartItem(
  userId: number,
  cartItemId: number,
): Promise<cartItemRepository.CartItemRecord> {
  const cartItem = await cartItemRepository.findById(cartItemId, userId);

  if (!cartItem) {
    throw new NotFoundError('요청한 장바구니 항목을 찾을 수 없습니다.');
  }

  return cartItem;
}
