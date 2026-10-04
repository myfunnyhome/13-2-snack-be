import { prisma } from '../../config/prisma';
import { Prisma } from '../../generated/prisma/client';

type FindManyParams = {
  userId: number;
  organizationId: number;
  skip: number;
  take: number;
};

const wishlistListArgs = {
  select: {
    product: {
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true,
        purchaseCount: true,
      },
    },
  },
} satisfies Prisma.WishlistItemDefaultArgs;

export type WishlistListRow = Prisma.WishlistItemGetPayload<
  typeof wishlistListArgs
>;

const productAccessArgs = {
  select: {
    id: true,
    organizationId: true,
    isDeleted: true,
  },
} satisfies Prisma.ProductDefaultArgs;

type ProductAccess = Prisma.ProductGetPayload<typeof productAccessArgs>;

const ORDER_BY: Prisma.WishlistItemOrderByWithRelationInput[] = [
  { createdAt: 'desc' },
  { id: 'desc' },
];

function buildWhere(
  userId: number,
  organizationId: number,
): Prisma.WishlistItemWhereInput {
  return {
    userId,
    product: {
      isDeleted: false,
      organizationId,
    },
  };
}

export function findMany({
  userId,
  organizationId,
  skip,
  take,
}: FindManyParams): Promise<[WishlistListRow[], number]> {
  const where = buildWhere(userId, organizationId);

  return Promise.all([
    prisma.wishlistItem.findMany({
      where,
      select: wishlistListArgs.select,
      orderBy: ORDER_BY,
      skip,
      take,
    }),
    prisma.wishlistItem.count({ where }),
  ]);
}

export function findAllIds(
  userId: number,
  organizationId: number,
): Promise<{ productId: number }[]> {
  return prisma.wishlistItem.findMany({
    where: buildWhere(userId, organizationId),
    select: { productId: true },
  });
}

export function findAccessById(
  productId: number,
): Promise<ProductAccess | null> {
  return prisma.product.findUnique({
    where: { id: productId },
    select: productAccessArgs.select,
  });
}

export function upsert(
  userId: number,
  productId: number,
): Promise<{ productId: number }> {
  return prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {},
    select: { productId: true },
  });
}

export function deleteOne(
  userId: number,
  productId: number,
): Promise<{ count: number }> {
  return prisma.wishlistItem.deleteMany({
    where: { userId, productId },
  });
}

export function deleteMany(
  userId: number,
  productIds: number[],
): Promise<{ count: number }> {
  return prisma.wishlistItem.deleteMany({
    where: { userId, productId: { in: productIds } },
  });
}
