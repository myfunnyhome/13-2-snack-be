import { NotFoundError } from '../../types/errors';
import * as productRepository from '../product/product.repository';
import * as wishlistRepository from './wishlist.repository';
import type { WishlistListRow } from './wishlist.repository';

type GetWishlistParams = {
  userId: number;
  page: number;
  limit: number;
};

type WishlistProductItem = WishlistListRow['product'];

type GetWishlistResult = {
  items: WishlistProductItem[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
};

type GetWishlistIdsParams = {
  userId: number;
};

type AddWishlistItemParams = {
  userId: number;
  organizationId: number; 
  productId: number;
};

type RemoveWishlistItemParams = {
  userId: number;
  productId: number;
};

type RemoveWishlistItemsParams = {
  userId: number;
  productIds: number[];
};

export async function getWishlist({
  userId,
  page,
  limit,
}: GetWishlistParams): Promise<GetWishlistResult> {
  const [rows, totalCount] = await wishlistRepository.findMany({
    userId,
    skip: (page - 1) * limit, 
    take: limit,
  });

  const totalPages = Math.ceil(totalCount / limit);

  return {
    items: rows.map((row) => row.product),
    page,
    limit,
    totalCount,
    totalPages,
    hasNext: page < totalPages,
  };
}

export async function getWishlistIds({
  userId,
}: GetWishlistIdsParams): Promise<{ productIds: number[] }> {
  const rows = await wishlistRepository.findAllIds(userId);

  return { productIds: rows.map((row) => row.productId) };
}

export async function addWishlistItem({
  userId,
  organizationId,
  productId,
}: AddWishlistItemParams): Promise<{ productId: number }> {
  const product = await productRepository.findOwnerById(
    productId,
    organizationId,
  );
  if (!product) {
    throw new NotFoundError('상품을 찾을 수 없습니다.');
  }
  return wishlistRepository.upsert(userId, productId);
}

export async function removeWishlistItem({
  userId,
  productId,
}: RemoveWishlistItemParams): Promise<{ productId: number }> {
  await wishlistRepository.deleteOne(userId, productId);

  return { productId };
}

// DELETE /me/wishlist (배치 해제)의 비즈니스 로직.
export async function removeWishlistItems({
  userId,
  productIds,
}: RemoveWishlistItemsParams): Promise<{ deletedCount: number }> {
  // repository가 { count: number } 형태로 실제 삭제된 행 수를 돌려준다.
  const { count } = await wishlistRepository.deleteMany(userId, productIds);

  // 응답 필드명은 deletedCount로 바꿔서 내려준다.
  return { deletedCount: count };
}
