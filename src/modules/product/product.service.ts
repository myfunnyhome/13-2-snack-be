import { Role } from '../../generated/prisma/client';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../types/errors';
import * as productRepository from './product.repository';
import type { ProductDetail, ProductListItem } from './product.repository';
import type {
  CreateProductInput,
  SearchProductsInput,
  UpdateProductInput,
} from './product.schema';

// 컨트롤러가 넘기는 req.auth 중 권한 판단에 쓰는 값만 받는다.
type Requester = {
  userId: number;
  role: Role;
  organizationId: number;
};

type SearchProductsParams = SearchProductsInput & {
  organizationId: number;
};

type SearchProductsResult = {
  products: ProductListItem[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  /** 상품 리스트가 무한 스크롤이라 다음 페이지를 요청할지 이 값으로 판단한다. */
  hasNext: boolean;
};

type CreateProductParams = CreateProductInput & {
  requester: Requester;
};

type UpdateProductParams = {
  productId: number;
  requester: Requester;
  data: UpdateProductInput;
};

type DeleteProductParams = {
  productId: number;
  requester: Requester;
};

// 없는 카테고리 id는 Prisma가 P2003을 던지는데 errorHandler가 처리하지 않아 500이 된다.
// 사용자 입력 실수이므로 미리 확인해 400으로 내보낸다.
async function assertCategoryExists(categoryId: number): Promise<void> {
  const category = await productRepository.findCategoryById(categoryId);

  if (!category) {
    throw new BadRequestError('존재하지 않는 카테고리입니다.');
  }
}

// 수정과 삭제는 등록자 본인 또는 관리자 이상만 할 수 있다.
async function assertCanModify(
  productId: number,
  requester: Requester,
): Promise<void> {
  const product = await productRepository.findOwnerById(
    productId,
    requester.organizationId,
  );

  if (!product) {
    throw new NotFoundError('상품을 찾을 수 없습니다.');
  }

  const isOwner = product.createdById === requester.userId;
  const isAdmin =
    requester.role === Role.ADMIN || requester.role === Role.SUPER_ADMIN;

  if (!isOwner && !isAdmin) {
    throw new ForbiddenError(
      '본인이 등록한 상품만 수정하거나 삭제할 수 있습니다.',
    );
  }
}

export async function searchProducts({
  organizationId,
  keyword,
  categoryId,
  sort,
  page,
  limit,
}: SearchProductsParams): Promise<SearchProductsResult> {
  const [products, totalCount] = await productRepository.findMany({
    organizationId,
    keyword,
    categoryId,
    sort,
    skip: (page - 1) * limit,
    take: limit,
  });

  // totalPages는 팀의 user 목록 API와 응답 형태를 맞추려고 그대로 둔다.
  const totalPages = Math.ceil(totalCount / limit);

  return {
    products,
    page,
    limit,
    totalCount,
    totalPages,
    hasNext: page < totalPages,
  };
}

export async function getProduct(
  productId: number,
  organizationId: number,
): Promise<ProductDetail> {
  const product = await productRepository.findDetailById(
    productId,
    organizationId,
  );

  if (!product) {
    throw new NotFoundError('상품을 찾을 수 없습니다.');
  }

  return product;
}

export async function createProduct({
  requester,
  categoryId,
  ...data
}: CreateProductParams): Promise<ProductDetail> {
  await assertCategoryExists(categoryId);

  return productRepository.create({
    ...data,
    categoryId,
    createdById: requester.userId,
    // 조직은 body로 받지 않는다. 받으면 다른 회사에 상품을 등록할 수 있다.
    organizationId: requester.organizationId,
  });
}

export async function updateProduct({
  productId,
  requester,
  data,
}: UpdateProductParams): Promise<ProductDetail> {
  await assertCanModify(productId, requester);

  if (data.categoryId !== undefined) {
    await assertCategoryExists(data.categoryId);
  }

  return productRepository.update(productId, data);
}

export async function deleteProduct({
  productId,
  requester,
}: DeleteProductParams): Promise<{ id: number }> {
  await assertCanModify(productId, requester);

  return productRepository.softDelete(productId);
}
