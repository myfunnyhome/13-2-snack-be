import { prisma } from '../../config/prisma';
import { Prisma } from '../../generated/prisma/client';

const cartItemArgs = {
  select: {
    id: true,
    quantity: true,
    productId: true,
    product: {
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true,
        isDeleted: true,
      },
    },
  },
} satisfies Prisma.CartItemDefaultArgs;

export type CartItemRecord = Prisma.CartItemGetPayload<typeof cartItemArgs>;

export function findManyByUserId(userId: number) {
  return prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    ...cartItemArgs,
  });
}

export function findById(id: number, userId: number) {
  return prisma.cartItem.findFirst({
    where: { id, userId },
    ...cartItemArgs,
  });
}

export function findByUserAndProduct(userId: number, productId: number) {
  return prisma.cartItem.findUnique({
    where: {
      userId_productId: { userId, productId },
    },
    select: {
      id: true,
      quantity: true,
    },
  });
}

export function findProduct(productId: number) {
  return prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      isDeleted: true,
      organizationId: true,
    },
  });
}

export function incrementQuantity(
  userId: number,
  productId: number,
  quantity: number,
) {
  return prisma.cartItem.upsert({
    where: {
      userId_productId: { userId, productId },
    },
    create: { userId, productId, quantity },
    update: { quantity: { increment: quantity } },
    ...cartItemArgs,
  });
}

export function updateQuantity(id: number, quantity: number) {
  return prisma.cartItem.update({
    where: { id },
    data: { quantity },
    ...cartItemArgs,
  });
}

export function remove(id: number) {
  return prisma.cartItem.delete({
    where: { id },
    ...cartItemArgs,
  });
}
