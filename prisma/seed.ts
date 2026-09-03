import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

import {
  OrderStatus,
  PrismaClient,
  Role,
} from '../src/generated/prisma/client';

const DELIVERY_FEE = 3000;
const DEMO_PASSWORD = 'Password123!';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

function orderTotal(itemSum: number) {
  return itemSum + DELIVERY_FEE;
}

async function clearDatabase() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.updateMany({ data: { parentId: null } });
  await prisma.category.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.account.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
}

async function main() {
  await clearDatabase();

  const password = await bcrypt.hash(DEMO_PASSWORD, 10);
  const now = new Date();
  const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const organization = await prisma.organization.create({
    data: {
      name: '스낵컴퍼니',
      bizRegNumber: '123-45-67890',
      defaultBudget: 500_000,
    },
  });

  const [superAdmin, admin, user] = await Promise.all([
    prisma.user.create({
      data: {
        name: '최최고',
        email: 'superadmin@snack.com',
        role: Role.SUPER_ADMIN,
        organizationId: organization.id,
        account: { create: { password } },
      },
    }),
    prisma.user.create({
      data: {
        name: '김관리',
        email: 'admin@snack.com',
        role: Role.ADMIN,
        organizationId: organization.id,
        account: { create: { password } },
      },
    }),
    prisma.user.create({
      data: {
        name: '이직원',
        email: 'user@snack.com',
        role: Role.GENERAL,
        organizationId: organization.id,
        account: { create: { password } },
      },
    }),
  ]);

  await prisma.user.create({
    data: {
      name: '박퇴사',
      email: 'inactive@snack.com',
      role: Role.GENERAL,
      isActive: false,
      organizationId: organization.id,
      account: { create: { password } },
    },
  });

  await prisma.invitation.createMany({
    data: [
      {
        email: 'invite@snack.com',
        name: '정초대',
        role: Role.GENERAL,
        organizationId: organization.id,
        used: false,
        expiresAt: inSevenDays,
      },
      {
        email: 'expired@snack.com',
        name: '강만료',
        role: Role.ADMIN,
        organizationId: organization.id,
        used: false,
        expiresAt: yesterday,
      },
      {
        email: 'used@snack.com',
        name: '오사용',
        role: Role.GENERAL,
        organizationId: organization.id,
        used: true,
        expiresAt: inSevenDays,
      },
    ],
  });

  const [snack, drink] = await Promise.all([
    prisma.category.create({ data: { name: '과자' } }),
    prisma.category.create({ data: { name: '음료' } }),
  ]);

  const [chip, cookie, chocolate, coffee, soda] = await Promise.all([
    prisma.category.create({
      data: { name: '칩', parentId: snack.id },
    }),
    prisma.category.create({
      data: { name: '쿠키', parentId: snack.id },
    }),
    prisma.category.create({
      data: { name: '초콜릿', parentId: snack.id },
    }),
    prisma.category.create({
      data: { name: '커피', parentId: drink.id },
    }),
    prisma.category.create({
      data: { name: '탄산', parentId: drink.id },
    }),
  ]);

  const [saewookkang, chocopie, homeRunBall, pepero, cola, americano] =
    await Promise.all([
      prisma.product.create({
        data: {
          name: '새우깡',
          price: 1500,
          productUrl: 'https://www.example.com/products/saewookkang',
          categoryId: chip.id,
          createdById: admin.id,
        },
      }),
      prisma.product.create({
        data: {
          name: '초코파이',
          price: 4800,
          productUrl: 'https://www.example.com/products/chocopie',
          categoryId: cookie.id,
          createdById: admin.id,
        },
      }),
      prisma.product.create({
        data: {
          name: '홈런볼',
          price: 2500,
          productUrl: 'https://www.example.com/products/homerunball',
          categoryId: chocolate.id,
          createdById: admin.id,
        },
      }),
      prisma.product.create({
        data: {
          name: '빼빼로',
          price: 1200,
          productUrl: 'https://www.example.com/products/pepero',
          categoryId: chocolate.id,
          createdById: admin.id,
        },
      }),
      prisma.product.create({
        data: {
          name: '콜라',
          price: 2000,
          productUrl: 'https://www.example.com/products/cola',
          categoryId: soda.id,
          createdById: admin.id,
        },
      }),
      prisma.product.create({
        data: {
          name: '아메리카노',
          price: 4500,
          productUrl: 'https://www.example.com/products/americano',
          categoryId: coffee.id,
          createdById: admin.id,
        },
      }),
    ]);

  await prisma.product.create({
    data: {
      name: '단종 과자',
      price: 1000,
      isDeleted: true,
      categoryId: chip.id,
      createdById: admin.id,
    },
  });

  const extraCategories = await Promise.all(
    [
      { name: '젤리', parentId: snack.id },
      { name: '사탕', parentId: snack.id },
      { name: '견과', parentId: snack.id },
      { name: '비스킷', parentId: snack.id },
      { name: '파이', parentId: snack.id },
      { name: '차', parentId: drink.id },
      { name: '주스', parentId: drink.id },
      { name: '우유', parentId: drink.id },
      { name: '에너지드링크', parentId: drink.id },
      { name: '생수', parentId: drink.id },
    ].map((data) => prisma.category.create({ data })),
  );

  const extraUsers = await Promise.all(
    [
      { name: '정민수', email: 'staff01@snack.com' },
      { name: '한서연', email: 'staff02@snack.com' },
      { name: '오준호', email: 'staff03@snack.com' },
      { name: '윤지아', email: 'staff04@snack.com' },
      { name: '임태현', email: 'staff05@snack.com' },
      { name: '신유진', email: 'staff06@snack.com' },
      { name: '배성민', email: 'staff07@snack.com' },
      { name: '조하린', email: 'staff08@snack.com' },
      { name: '권도윤', email: 'staff09@snack.com' },
      { name: '황예린', email: 'staff10@snack.com' },
    ].map((item) =>
      prisma.user.create({
        data: {
          name: item.name,
          email: item.email,
          role: Role.GENERAL,
          organizationId: organization.id,
          account: { create: { password } },
        },
      }),
    ),
  );

  const extraProducts = await Promise.all(
    [
      { name: '마이구미', price: 1800, slug: 'mygummi' },
      { name: '하리보', price: 2200, slug: 'haribo' },
      { name: '허니버터아몬드', price: 3500, slug: 'honey-almond' },
      { name: '다이제', price: 2800, slug: 'digestive' },
      { name: '후렌치파이', price: 3200, slug: 'french-pie' },
      { name: '녹차', price: 1500, slug: 'green-tea' },
      { name: '오렌지주스', price: 2500, slug: 'orange-juice' },
      { name: '바나나우유', price: 1800, slug: 'banana-milk' },
      { name: '핫식스', price: 2000, slug: 'hotsix' },
      { name: '삼다수', price: 1000, slug: 'samdasoo' },
    ].map((item, index) =>
      prisma.product.create({
        data: {
          name: item.name,
          price: item.price,
          productUrl: `https://www.example.com/products/${item.slug}`,
          categoryId: extraCategories[index].id,
          createdById: admin.id,
        },
      }),
    ),
  );

  await prisma.invitation.createMany({
    data: Array.from({ length: 10 }, (_, i) => ({
      email: `newhire${String(i + 1).padStart(2, '0')}@snack.com`,
      name: `신규${i + 1}`,
      role: Role.GENERAL,
      organizationId: organization.id,
      used: i % 3 === 0,
      expiresAt: i % 4 === 0 ? yesterday : inSevenDays,
    })),
  });

  await prisma.cartItem.createMany({
    data: [
      { userId: user.id, productId: saewookkang.id, quantity: 3 },
      { userId: user.id, productId: chocopie.id, quantity: 1 },
      ...extraUsers.map((extraUser, i) => ({
        userId: extraUser.id,
        productId: extraProducts[i].id,
        quantity: (i % 3) + 1,
      })),
    ],
  });

  await prisma.wishlistItem.createMany({
    data: [
      { userId: user.id, productId: homeRunBall.id },
      { userId: user.id, productId: americano.id },
      ...extraUsers.map((extraUser, i) => ({
        userId: extraUser.id,
        productId: extraProducts[(i + 3) % extraProducts.length].id,
      })),
    ],
  });

  const pendingItemSum = saewookkang.price * 2 + chocopie.price;
  const approvedRequestItemSum = cola.price * 6;
  const instantBuyItemSum = pepero.price * 20;
  const rejectedItemSum = americano.price * 10;
  const canceledItemSum = homeRunBall.price;

  await prisma.order.create({
    data: {
      status: OrderStatus.PENDING,
      totalPrice: orderTotal(pendingItemSum),
      deliveryFee: DELIVERY_FEE,
      requestMessage: '사무실 간식으로 부탁드립니다.',
      requesterId: user.id,
      items: {
        create: [
          {
            productId: saewookkang.id,
            quantity: 2,
            priceAtOrder: saewookkang.price,
          },
          {
            productId: chocopie.id,
            quantity: 1,
            priceAtOrder: chocopie.price,
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      status: OrderStatus.APPROVED,
      totalPrice: orderTotal(approvedRequestItemSum),
      deliveryFee: DELIVERY_FEE,
      requestMessage: '회의용 음료가 필요합니다.',
      responseMessage: '승인합니다.',
      requesterId: user.id,
      handlerId: admin.id,
      items: {
        create: [
          {
            productId: cola.id,
            quantity: 6,
            priceAtOrder: cola.price,
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      status: OrderStatus.APPROVED,
      totalPrice: orderTotal(instantBuyItemSum),
      deliveryFee: DELIVERY_FEE,
      responseMessage: '관리자 즉시구매',
      requesterId: admin.id,
      handlerId: admin.id,
      items: {
        create: [
          {
            productId: pepero.id,
            quantity: 20,
            priceAtOrder: pepero.price,
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      status: OrderStatus.REJECTED,
      totalPrice: orderTotal(rejectedItemSum),
      deliveryFee: DELIVERY_FEE,
      requestMessage: '커피 대량 구매 요청합니다.',
      responseMessage: '예산 초과로 반려합니다.',
      requesterId: user.id,
      handlerId: admin.id,
      items: {
        create: [
          {
            productId: americano.id,
            quantity: 10,
            priceAtOrder: americano.price,
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      status: OrderStatus.CANCELED,
      totalPrice: orderTotal(canceledItemSum),
      deliveryFee: DELIVERY_FEE,
      requestMessage: '잘못 담아서 취소합니다.',
      requesterId: user.id,
      items: {
        create: [
          {
            productId: homeRunBall.id,
            quantity: 1,
            priceAtOrder: homeRunBall.price,
          },
        ],
      },
    },
  });

  await prisma.product.update({
    where: { id: cola.id },
    data: { purchaseCount: { increment: 6 } },
  });
  await prisma.product.update({
    where: { id: pepero.id },
    data: { purchaseCount: { increment: 20 } },
  });

  const extraOrderStatuses = [
    OrderStatus.PENDING,
    OrderStatus.APPROVED,
    OrderStatus.REJECTED,
    OrderStatus.CANCELED,
    OrderStatus.PENDING,
    OrderStatus.APPROVED,
    OrderStatus.REJECTED,
    OrderStatus.CANCELED,
    OrderStatus.PENDING,
    OrderStatus.APPROVED,
  ];

  for (let i = 0; i < extraUsers.length; i += 1) {
    const extraProduct = extraProducts[i];
    const quantity = (i % 3) + 1;
    const status = extraOrderStatuses[i];
    const isApproved = status === OrderStatus.APPROVED;
    const isRejected = status === OrderStatus.REJECTED;
    const itemSum = extraProduct.price * quantity;

    await prisma.order.create({
      data: {
        status,
        totalPrice: orderTotal(itemSum),
        deliveryFee: DELIVERY_FEE,
        requestMessage: `${extraProduct.name} 구매 요청합니다.`,
        responseMessage: isApproved
          ? '승인합니다.'
          : isRejected
            ? '반려합니다.'
            : undefined,
        requesterId: extraUsers[i].id,
        handlerId: isApproved || isRejected ? admin.id : undefined,
        items: {
          create: [
            {
              productId: extraProduct.id,
              quantity,
              priceAtOrder: extraProduct.price,
            },
          ],
        },
      },
    });

    if (isApproved) {
      await prisma.product.update({
        where: { id: extraProduct.id },
        data: { purchaseCount: { increment: quantity } },
      });
    }
  }

  const approvedSpend = await prisma.order.aggregate({
    where: { status: OrderStatus.APPROVED },
    _sum: { totalPrice: true },
  });

  await prisma.budget.create({
    data: {
      organizationId: organization.id,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      startingBudget: organization.defaultBudget,
      spentAmount: approvedSpend._sum.totalPrice ?? 0,
    },
  });

  await prisma.budget.createMany({
    data: Array.from({ length: 10 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (i + 1), 1);
      return {
        organizationId: organization.id,
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        startingBudget: organization.defaultBudget,
        spentAmount: 40_000 * (i + 1),
      };
    }),
  });

  console.log('Seed completed.');
  console.log('Demo accounts (password: Password123!)');
  console.log(`  SUPER_ADMIN  ${superAdmin.email}`);
  console.log(`  ADMIN        ${admin.email}`);
  console.log(`  GENERAL      ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
