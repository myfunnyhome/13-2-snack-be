import { ForbiddenError, NotFoundError } from '../../types/errors';
import * as wishlistRepository from './wishlist.repository';
import type { WishlistListRow } from './wishlist.repository';

type GetWishlistParams = {
  userId: number;
  organizationId: number;
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
  organizationId: number;
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
  organizationId,
  page,
  limit,
}: GetWishlistParams): Promise<GetWishlistResult> {
  const [rows, totalCount] = await wishlistRepository.findMany({
    userId,
    organizationId,
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
  organizationId,
}: GetWishlistIdsParams): Promise<{ productIds: number[] }> {
  const rows = await wishlistRepository.findAllIds(userId, organizationId);
  return { productIds: rows.map((row) => row.productId) };
}

export async function addWishlistItem({
  userId,
  organizationId,
  productId,
}: AddWishlistItemParams): Promise<{ productId: number }> {
  const product = await wishlistRepository.findAccessById(productId);

  if (!product || product.isDeleted) {
    throw new NotFoundError('상품을 찾을 수 없습니다.');
  }

  if (product.organizationId !== organizationId) {
    throw new ForbiddenError('다른 조직의 상품은 찜할 수 없습니다.');
  }

  return wishlistRepository.upsert(userId, productId);
}

export async function removeWishlistItem({
  userId,
  productId,
}: RemoveWishlistItemParams): Promise<{
  productId: number;
  deletedCount: number;
}> {
  const { count } = await wishlistRepository.deleteOne(userId, productId);

  return { productId, deletedCount: count };
}

export async function removeWishlistItems({
  userId,
  productIds,
}: RemoveWishlistItemsParams): Promise<{ deletedCount: number }> {
  const { count } = await wishlistRepository.deleteMany(userId, productIds);
  return { deletedCount: count };
}
