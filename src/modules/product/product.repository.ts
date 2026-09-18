import { prisma } from '../../config/prisma';
import { Prisma } from '../../generated/prisma/client';
import type { ProductSort } from './product.schema';

type FindManyParams = {
  organizationId: number;
  // 상품 등록 내역(GET /me/products)에서 등록자로 거를 때만 넣는다.
  createdById?: number;
  keyword?: string;
  categoryId?: number;
  parentCategoryId?: number;
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
  // null은 값을 비운다는 뜻이다.
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

// id를 마지막 정렬 키로 둔다. 정렬 값이 같을 때 순서가 흔들리면
// 무한 스크롤에서 같은 상품이 중복되거나 누락된다.
const ORDER_BY: Record<ProductSort, Prisma.ProductOrderByWithRelationInput[]> =
  {
    latest: [{ createdAt: 'desc' }, { id: 'desc' }],
    popular: [{ purchaseCount: 'desc' }, { id: 'desc' }],
    priceAsc: [{ price: 'asc' }, { id: 'desc' }],
    priceDesc: [{ price: 'desc' }, { id: 'desc' }],
  };

// 회사별로 거른다. categoryId는 소분류 하나, parentCategoryId는 그 대분류 아래 전체를 뜻한다.
function buildWhere({
  organizationId,
  createdById,
  keyword,
  categoryId,
  parentCategoryId,
}: Pick<
  FindManyParams,
  | 'organizationId'
  | 'createdById'
  | 'keyword'
  | 'categoryId'
  | 'parentCategoryId'
>): Prisma.ProductWhereInput {
  return {
    isDeleted: false,
    organizationId,
    ...(createdById ? { createdById } : {}),
    ...(keyword
      ? { name: { contains: keyword, mode: Prisma.QueryMode.insensitive } }
      : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(parentCategoryId ? { category: { parentId: parentCategoryId } } : {}),
  };
}

export function findMany({
  organizationId,
  createdById,
  keyword,
  categoryId,
  parentCategoryId,
  sort,
  skip,
  take,
}: FindManyParams): Promise<[ProductListItem[], number]> {
  const where = buildWhere({
    organizationId,
    createdById,
    keyword,
    categoryId,
    parentCategoryId,
  });

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

// 카테고리는 별도 모듈이 없어 존재 확인만 여기에 둔다. 카테고리 도메인이 생기면 옮긴다.
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
