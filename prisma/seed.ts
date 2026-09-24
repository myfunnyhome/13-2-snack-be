import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

import {
  OrderStatus,
  PrismaClient,
  Role,
} from '../src/generated/prisma/client';
import { hashToken } from '../src/utils/token';
import { SEED_CATEGORIES, SEED_PRODUCTS } from './seedCatalog';

const DELIVERY_FEE = 3000;
const DEMO_PASSWORD = 'Password123!';

// 카테고리 id를 고정으로 넣으므로 시퀀스를 그 위에서 다시 시작한다.
const CATEGORY_ID_SEQUENCE_START = 200;

// 주문·장바구니 시나리오용 데모 상품이 쓰는 소분류 id (prisma/seedCatalog.ts 기준)
const DEMO_CATEGORY = {
  snack: 101, // 과자
  pie: 103, // 파이
  chocolate: 104, // 초콜릿류
  biscuit: 107, // 비스켓류
  jelly: 109, // 젤리류
  nuts: 110, // 견과류
  soda: 112, // 청량/탄산음료
  juice: 113, // 과즙음료
  energyDrink: 114, // 에너지음료
  tea: 118, // 차류
  milk: 119, // 두유/우유
  coffee: 120, // 커피
  water: 121, // 생수
} as const;

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

  // 시드를 반복 실행해도 항상 id가 1부터 시작하도록 시퀀스 리셋
  // (auto-increment 시퀀스는 deleteMany로 지워지지 않고 계속 누적됨)
  await prisma.$executeRawUnsafe(`
    ALTER SEQUENCE "Organization_id_seq" RESTART WITH 1;
    ALTER SEQUENCE "User_id_seq" RESTART WITH 1;
    ALTER SEQUENCE "Product_id_seq" RESTART WITH 1;
    ALTER SEQUENCE "Category_id_seq" RESTART WITH 1;
    ALTER SEQUENCE "CartItem_id_seq" RESTART WITH 1;
    ALTER SEQUENCE "WishlistItem_id_seq" RESTART WITH 1;
    ALTER SEQUENCE "Order_id_seq" RESTART WITH 1;
    ALTER SEQUENCE "OrderItem_id_seq" RESTART WITH 1;
    ALTER SEQUENCE "Budget_id_seq" RESTART WITH 1;
    ALTER SEQUENCE "Invitation_id_seq" RESTART WITH 1;
  `);
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
      bizRegNumber: '1234567890',
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
        token: hashToken('seed-token-invite'),
        usedAt: null,
        expiresAt: inSevenDays,
      },
      {
        email: 'expired@snack.com',
        name: '강만료',
        role: Role.ADMIN,
        organizationId: organization.id,
        token: hashToken('seed-token-expired'),
        usedAt: null,
        expiresAt: yesterday,
      },
      {
        email: 'used@snack.com',
        name: '오사용',
        role: Role.GENERAL,
        organizationId: organization.id,
        token: hashToken('seed-token-used'),
        usedAt: yesterday,
        expiresAt: inSevenDays,
      },
    ],
  });

  // 카테고리는 id를 고정해서 넣는다. 프론트가 카테고리를 상수로 들고 있어서
  // id가 실행할 때마다 바뀌면 화면의 카테고리 필터가 전부 어긋난다.
  // 대분류를 먼저 넣어야 소분류의 parentId 외래키가 걸리지 않는다.
  await prisma.category.createMany({
    data: SEED_CATEGORIES.filter((category) => category.parentId === null),
  });
  await prisma.category.createMany({
    data: SEED_CATEGORIES.filter((category) => category.parentId !== null),
  });

  // id를 직접 넣으면 시퀀스가 그대로라, 이후 등록에서 id가 충돌한다.
  await prisma.$executeRawUnsafe(
    `ALTER SEQUENCE "Category_id_seq" RESTART WITH ${CATEGORY_ID_SEQUENCE_START};`,
  );

  const [saewookkang, chocopie, homeRunBall, pepero, cola, americano] =
    await Promise.all([
      prisma.product.create({
        data: {
          name: '새우깡',
          price: 1500,
          productUrl: 'https://www.example.com/products/saewookkang',
          categoryId: DEMO_CATEGORY.snack,
          createdById: admin.id,
          organizationId: organization.id,
        },
      }),
      prisma.product.create({
        data: {
          name: '초코파이',
          price: 4800,
          productUrl: 'https://www.example.com/products/chocopie',
          categoryId: DEMO_CATEGORY.pie,
          createdById: admin.id,
          organizationId: organization.id,
        },
      }),
      prisma.product.create({
        data: {
          name: '홈런볼',
          price: 2500,
          productUrl: 'https://www.example.com/products/homerunball',
          categoryId: DEMO_CATEGORY.snack,
          createdById: admin.id,
          organizationId: organization.id,
        },
      }),
      prisma.product.create({
        data: {
          name: '빼빼로',
          price: 1200,
          productUrl: 'https://www.example.com/products/pepero',
          categoryId: DEMO_CATEGORY.chocolate,
          createdById: admin.id,
          organizationId: organization.id,
        },
      }),
      prisma.product.create({
        data: {
          name: '콜라',
          price: 2000,
          productUrl: 'https://www.example.com/products/cola',
          categoryId: DEMO_CATEGORY.soda,
          createdById: admin.id,
          organizationId: organization.id,
        },
      }),
      prisma.product.create({
        data: {
          name: '아메리카노',
          price: 4500,
          productUrl: 'https://www.example.com/products/americano',
          categoryId: DEMO_CATEGORY.coffee,
          createdById: admin.id,
          organizationId: organization.id,
        },
      }),
    ]);

  await prisma.product.create({
    data: {
      name: '단종 과자',
      price: 1000,
      isDeleted: true,
      categoryId: DEMO_CATEGORY.snack,
      createdById: admin.id,
      organizationId: organization.id,
    },
  });

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
      {
        name: '마이구미',
        price: 1800,
        slug: 'mygummi',
        categoryId: DEMO_CATEGORY.jelly,
      },
      {
        name: '하리보',
        price: 2200,
        slug: 'haribo',
        categoryId: DEMO_CATEGORY.jelly,
      },
      {
        name: '허니버터아몬드',
        price: 3500,
        slug: 'honey-almond',
        categoryId: DEMO_CATEGORY.nuts,
      },
      {
        name: '다이제',
        price: 2800,
        slug: 'digestive',
        categoryId: DEMO_CATEGORY.biscuit,
      },
      {
        name: '후렌치파이',
        price: 3200,
        slug: 'french-pie',
        categoryId: DEMO_CATEGORY.pie,
      },
      {
        name: '녹차',
        price: 1500,
        slug: 'green-tea',
        categoryId: DEMO_CATEGORY.tea,
      },
      {
        name: '오렌지주스',
        price: 2500,
        slug: 'orange-juice',
        categoryId: DEMO_CATEGORY.juice,
      },
      {
        name: '바나나우유',
        price: 1800,
        slug: 'banana-milk',
        categoryId: DEMO_CATEGORY.milk,
      },
      {
        name: '핫식스',
        price: 2000,
        slug: 'hotsix',
        categoryId: DEMO_CATEGORY.energyDrink,
      },
      {
        name: '삼다수',
        price: 1000,
        slug: 'samdasoo',
        categoryId: DEMO_CATEGORY.water,
      },
    ].map((item) =>
      prisma.product.create({
        data: {
          name: item.name,
          price: item.price,
          productUrl: `https://www.example.com/products/${item.slug}`,
          categoryId: item.categoryId,
          createdById: admin.id,
          organizationId: organization.id,
        },
      }),
    ),
  );

  // 공식 시드 상품. 목록 정렬·무한 스크롤 QA에 쓸 카탈로그다.
  await prisma.product.createMany({
    data: SEED_PRODUCTS.map((product) => ({
      ...product,
      createdById: admin.id,
      organizationId: organization.id,
    })),
  });

  // 위 상품은 전부 관리자가 등록한 것이라, 일반 회원으로 로그인하면
  // "상품 등록 내역"이 비어 보인다. 그 화면을 확인할 수 있게 일반 회원 상품을 따로 넣는다.
  await prisma.product.createMany({
    data: [
      {
        name: '츄파춥스',
        price: 500,
        categoryId: DEMO_CATEGORY.snack,
        createdById: user.id,
      },
      {
        name: '웰치스 포도',
        price: 1600,
        categoryId: DEMO_CATEGORY.juice,
        createdById: user.id,
      },
      {
        name: '아몬드 브리즈',
        price: 2400,
        categoryId: DEMO_CATEGORY.milk,
        createdById: user.id,
      },
      {
        name: '몽쉘',
        price: 4200,
        categoryId: DEMO_CATEGORY.pie,
        createdById: user.id,
      },
      {
        name: '포카리스웨트',
        price: 1300,
        categoryId: DEMO_CATEGORY.soda,
        createdById: extraUsers[0].id,
      },
    ].map((product) => ({
      ...product,
      productUrl: 'https://www.example.com/products/member',
      organizationId: organization.id,
    })),
  });

  await prisma.invitation.createMany({
    data: Array.from({ length: 10 }, (_, i) => ({
      email: `newhire${String(i + 1).padStart(2, '0')}@snack.com`,
      name: `신규${i + 1}`,
      role: Role.GENERAL,
      organizationId: organization.id,
      token: hashToken(`seed-token-newhire${String(i + 1).padStart(2, '0')}`),
      usedAt: i % 3 === 0 ? yesterday : null,
      expiresAt: i % 4 === 0 ? yesterday : inSevenDays,
    })),
  });

  await prisma.cartItem.createMany({
    data: [
      { userId: user.id, productId: saewookkang.id, quantity: 3 }, // 1: 취소용
      { userId: user.id, productId: chocopie.id, quantity: 1 }, // 2: 승인용
      { userId: user.id, productId: homeRunBall.id, quantity: 1 }, // 3: 반려용
      { userId: user.id, productId: pepero.id, quantity: 1 }, // 4: quantity=0 테스트용
      { userId: admin.id, productId: cola.id, quantity: 10 }, // 5: 즉시구매 정상용
      { userId: admin.id, productId: americano.id, quantity: 20 }, // 6: 즉시구매 예산초과용
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
      organizationId: organization.id,
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
      organizationId: organization.id,
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
      organizationId: organization.id,
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
      organizationId: organization.id,
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
      organizationId: organization.id,
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
        organizationId: organization.id,
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
  console.log(
    'Test invitation token: seed-token-invite (email: invite@snack.com)',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
