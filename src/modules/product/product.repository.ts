import { prisma } from '../../config/prisma';
import { Prisma } from '../../generated/prisma/client';
import type { ProductSort } from './product.schema';

type FindManyParams = {
  organizationId: number;
  keyword?: string;
  categoryId?: number;
  sort: ProductSort;
  skip: number;
  take: number;
};

type CreateData = {
  name: string;
  price: number;
  categoryId: number;
  createdById: number;
  organizationId: number;
  // null은 값을 비우는 뜻이다. 수정에서 이미지·링크를 지울 수 있어야 해서 허용한다.
  imageUrl?: string | null;
  productUrl?: string | null;
};

// 등록자와 소속 조직은 등록 시점에 정해지고 수정으로 바꿀 수 없다.
type UpdateData = Partial<Omit<CreateData, 'createdById' | 'organizationId'>>;

const productListArgs = {
  select: {
    id: true,
    name: true,
    price: true,
    imageUrl: true,
    purchaseCount: true,
    createdAt: true,
    category: { select: { id: true, name: true, parentId: true } },
  },
} satisfies Prisma.ProductDefaultArgs;

export type ProductListItem = Prisma.ProductGetPayload<typeof productListArgs>;

const productDetailArgs = {
  select: {
    id: true,
    name: true,
    price: true,
    imageUrl: true,
    productUrl: true,
    purchaseCount: true,
    createdAt: true,
    updatedAt: true,
    category: { select: { id: true, name: true, parentId: true } },
    createdBy: { select: { id: true, name: true } },
  },
} satisfies Prisma.ProductDefaultArgs;

export type ProductDetail = Prisma.ProductGetPayload<typeof productDetailArgs>;

const productOwnerArgs = {
  select: { id: true, createdById: true },
} satisfies Prisma.ProductDefaultArgs;

export type ProductOwner = Prisma.ProductGetPayload<
  typeof productOwnerArgs
> | null;

/*
정렬 기준마다 id를 마지막 키로 덧붙인다.
정렬 값이 같은 상품이 여러 개일 때 순서가 흔들리면
페이지를 넘길 때 같은 상품이 또 나오거나 빠질 수 있다.
*/
const ORDER_BY: Record<ProductSort, Prisma.ProductOrderByWithRelationInput[]> =
  {
    latest: [{ createdAt: 'desc' }, { id: 'desc' }],
    popular: [{ purchaseCount: 'desc' }, { id: 'desc' }],
    priceAsc: [{ price: 'asc' }, { id: 'desc' }],
    priceDesc: [{ price: 'desc' }, { id: 'desc' }],
  };

/*
Product.organizationId(Organization 1:N)로 회사별 상품만 거른다.
categoryId가 대분류면 그 하위 소분류 상품까지 포함한다.
*/
function buildWhere({
  organizationId,
  keyword,
  categoryId,
}: Pick<
  FindManyParams,
  'organizationId' | 'keyword' | 'categoryId'
>): Prisma.ProductWhereInput {
  return {
    isDeleted: false,
    organizationId,
    // mode를 빼면 PostgreSQL이 대소문자를 구분해 'coca'로 'Coca Cola'를 못 찾는다.
    ...(keyword
      ? { name: { contains: keyword, mode: Prisma.QueryMode.insensitive } }
      : {}),
    ...(categoryId
      ? { OR: [{ categoryId }, { category: { parentId: categoryId } }] }
      : {}),
  };
}

export function findMany({
  organizationId,
  keyword,
  categoryId,
  sort,
  skip,
  take,
}: FindManyParams): Promise<[ProductListItem[], number]> {
  const where = buildWhere({ organizationId, keyword, categoryId });

  return Promise.all([
    prisma.product.findMany({
      where,
      select: productListArgs.select,
      orderBy: ORDER_BY[sort],
      skip,
      take,
    }),
    prisma.product.count({ where }),
  ]);
}

export function findDetailById(
  productId: number,
  organizationId: number,
): Promise<ProductDetail | null> {
  return prisma.product.findFirst({
    where: { id: productId, isDeleted: false, organizationId },
    select: productDetailArgs.select,
  });
}

export function findOwnerById(
  productId: number,
  organizationId: number,
): Promise<ProductOwner> {
  return prisma.product.findFirst({
    where: { id: productId, isDeleted: false, organizationId },
    select: productOwnerArgs.select,
  });
}

/*
카테고리는 프론트에서 고정 목록으로 관리하기로 해서 별도 API와 모듈이 없다.
상품 등록·수정 시 존재 여부만 확인하면 되므로 여기에 둔다.
*/
export function findCategoryById(
  categoryId: number,
): Promise<{ id: number } | null> {
  return prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });
}

export function create(data: CreateData): Promise<ProductDetail> {
  return prisma.product.create({
    data,
    select: productDetailArgs.select,
  });
}

export function update(
  productId: number,
  data: UpdateData,
): Promise<ProductDetail> {
  return prisma.product.update({
    where: { id: productId },
    data,
    select: productDetailArgs.select,
  });
}

export function softDelete(productId: number): Promise<{ id: number }> {
  return prisma.product.update({
    where: { id: productId },
    data: { isDeleted: true },
    select: { id: true },
  });
}
