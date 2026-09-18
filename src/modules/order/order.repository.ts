import { prisma } from '../../config/prisma';
import { OrderStatus, Prisma } from '../../generated/prisma/client';

// ------------------------------
// select/include 상수 + 타입 추론
// ------------------------------

const orderDetailArgs = {
  include: {
    requester: { select: { id: true, name: true } }, // User
    handler: { select: { id: true, name: true } }, // User
    items: { include: { product: true } }, // OrderItem[] + Product
  },
} satisfies Prisma.OrderDefaultArgs;

export type OrderDetail = Prisma.OrderGetPayload<typeof orderDetailArgs>;

const orderListItemArgs = {
  include: {
    requester: { select: { id: true, name: true } }, // User
    handler: { select: { id: true, name: true } }, // User
    items: {
      select: {
        product: { select: { name: true } }, // OrderItem[] → Product.name만
      },
    },
  },
} satisfies Prisma.OrderDefaultArgs;

export type OrderListItem = Prisma.OrderGetPayload<typeof orderListItemArgs>;

// ------------------------------
// POST /orders 관련
// ------------------------------

export function findCartItemsByIds(ids: number[], userId: number) {
  return prisma.cartItem.findMany({
    where: {
      id: { in: ids },
      userId,
    },
    include: {
      product: true,
    },
  });
}

type OrderItemInput = {
  productId: number;
  quantity: number;
  priceAtOrder: number;
};

export function createOrder(data: {
  organizationId: number;
  requesterId: number;
  requestMessage?: string;
  deliveryFee: number;
  totalPrice: number;
  items: OrderItemInput[];
}) {
  return prisma.order.create({
    data: {
      status: OrderStatus.PENDING,
      organizationId: data.organizationId,
      requesterId: data.requesterId,
      requestMessage: data.requestMessage,
      deliveryFee: data.deliveryFee,
      totalPrice: data.totalPrice,
      items: {
        create: data.items,
      },
    },
  });
}

export function createApprovedOrder(data: {
  organizationId: number;
  requesterId: number;
  handlerId: number;
  responseMessage: string;
  deliveryFee: number;
  totalPrice: number;
  items: OrderItemInput[];
}) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        status: OrderStatus.APPROVED,
        organizationId: data.organizationId,
        requesterId: data.requesterId,
        handlerId: data.handlerId,
        responseMessage: data.responseMessage,
        deliveryFee: data.deliveryFee,
        totalPrice: data.totalPrice,
        items: {
          create: data.items,
        },
      },
      include: { items: true },
    });

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { purchaseCount: { increment: item.quantity } },
      });
    }

    const now = new Date();
    await tx.budget.update({
      where: {
        organizationId_year_month: {
          organizationId: data.organizationId,
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        },
      },
      data: { spentAmount: { increment: data.totalPrice } },
    });

    return order;
  });
}

export function deleteCartItems(ids: number[]) {
  return prisma.cartItem.deleteMany({
    where: { id: { in: ids } },
  });
}

// ------------------------------
// 상태 확인용 (cancel/approve/reject에서 재사용)
// ------------------------------

export function findOrderStatus(
  id: number,
  where: { requesterId?: number; organizationId?: number },
) {
  return prisma.order.findFirst({
    where: { id, ...where },
    select: { status: true, totalPrice: true },
  });
}

// ------------------------------
// GET /me/orders 관련
// ------------------------------

function resolveOrderBy(
  sort: 'latest' | 'lowPrice' | 'highPrice',
): Prisma.OrderOrderByWithRelationInput {
  if (sort === 'lowPrice') return { totalPrice: 'asc' };
  if (sort === 'highPrice') return { totalPrice: 'desc' };
  return { createdAt: 'desc' };
}

export function findMyOrders(
  userId: number,
  options: {
    sort: 'latest' | 'lowPrice' | 'highPrice';
    page: number;
    limit: number;
  },
) {
  return prisma.order.findMany({
    where: { requesterId: userId },
    orderBy: resolveOrderBy(options.sort),
    skip: (options.page - 1) * options.limit,
    take: options.limit,
    ...orderListItemArgs,
  });
}

export function countMyOrders(userId: number) {
  return prisma.order.count({ where: { requesterId: userId } });
}

export function findMyOrderById(id: number, userId: number) {
  return prisma.order.findFirst({
    where: { id, requesterId: userId },
    ...orderDetailArgs,
  });
}

export function cancelOrder(id: number, userId: number) {
  return prisma.order.update({
    where: { id, requesterId: userId },
    data: { status: OrderStatus.CANCELED },
  });
}

// ------------------------------
// GET /admin/orders 관련
// ------------------------------

export function findOrgOrders(
  orgId: number,
  options: {
    status?: OrderStatus;
    sort: 'latest' | 'lowPrice' | 'highPrice';
    page: number;
    limit: number;
  },
) {
  return prisma.order.findMany({
    where: {
      organizationId: orgId,
      ...(options.status && { status: options.status }),
    },
    orderBy: resolveOrderBy(options.sort),
    skip: (options.page - 1) * options.limit,
    take: options.limit,
    ...orderListItemArgs,
  });
}

export function countOrgOrders(orgId: number, status?: OrderStatus) {
  return prisma.order.count({
    where: {
      organizationId: orgId,
      ...(status && { status }),
    },
  });
}

export function findOrgOrderById(id: number, orgId: number) {
  return prisma.order.findFirst({
    where: { id, organizationId: orgId },
    ...orderDetailArgs,
  });
}

// ------------------------------
// approve / reject 관련
// ------------------------------

export function findCurrentBudget(orgId: number) {
  const now = new Date();
  return prisma.budget.findUnique({
    where: {
      organizationId_year_month: {
        organizationId: orgId,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      },
    },
  });
}

export function approveOrder(
  id: number,
  orgId: number,
  data: { handlerId: number; responseMessage: string },
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: { id, organizationId: orgId },
      data: {
        status: OrderStatus.APPROVED,
        handlerId: data.handlerId,
        responseMessage: data.responseMessage,
      },
      include: { items: true },
    });

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { purchaseCount: { increment: item.quantity } },
      });
    }

    const now = new Date();
    await tx.budget.update({
      where: {
        organizationId_year_month: {
          organizationId: orgId,
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        },
      },
      data: { spentAmount: { increment: order.totalPrice } },
    });

    return order;
  });
}

export function rejectOrder(
  id: number,
  orgId: number,
  data: { handlerId: number; responseMessage: string },
) {
  return prisma.order.update({
    where: { id, organizationId: orgId },
    data: {
      status: OrderStatus.REJECTED,
      handlerId: data.handlerId,
      responseMessage: data.responseMessage,
    },
  });
}
