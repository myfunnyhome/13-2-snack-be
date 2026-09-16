import { z } from 'zod';

export const PRODUCT_SORTS = [
  'latest',
  'popular',
  'priceAsc',
  'priceDesc',
] as const;

export type ProductSort = (typeof PRODUCT_SORTS)[number];

/*
이미지와 제품 링크는 값을 비울 수 있어야 한다.
상품 수정 모달에 이미지 삭제 버튼이 있고, 제품 링크는 입력칸을 지우면 빈 문자열로 온다.
그래서 URL 문자열 외에 null과 빈 문자열도 받고, 빈 문자열은 null로 바꿔 저장한다.
*/
function nullableUrlSchema(message: string) {
  return z
    .preprocess(
      (value) => (typeof value === 'string' ? value.trim() : value),
      z.union([z.literal(''), z.null(), z.url({ error: message })]),
    )
    .transform((value) => (value === '' ? null : value));
}

export const productIdParamsSchema = z.object({
  id: z.coerce
    .number({ error: '올바른 상품 ID가 아닙니다.' })
    .int({ error: '올바른 상품 ID가 아닙니다.' })
    .positive({ error: '올바른 상품 ID가 아닙니다.' }),
});

export const searchProductsSchema = z.object({
  keyword: z.string().trim().optional(),

  // 대분류 ID를 보내면 하위 소분류 상품까지 함께 조회된다.
  categoryId: z.coerce
    .number({ error: 'categoryId는 숫자여야 합니다.' })
    .int({ error: 'categoryId는 정수여야 합니다.' })
    .positive({ error: 'categoryId는 1 이상이어야 합니다.' })
    .optional(),

  sort: z
    .enum(PRODUCT_SORTS, {
      error: '정렬 조건은 latest, popular, priceAsc, priceDesc만 가능합니다.',
    })
    .default('latest'),

  page: z.coerce
    .number({ error: 'page는 숫자여야 합니다.' })
    .int({ error: 'page는 정수여야 합니다.' })
    .min(1, { error: 'page는 1 이상이어야 합니다.' })
    .default(1),

  limit: z.coerce
    .number({ error: 'limit은 숫자여야 합니다.' })
    .int({ error: 'limit은 정수여야 합니다.' })
    .min(1, { error: 'limit은 1 이상이어야 합니다.' })
    .max(100, { error: 'limit은 100 이하여야 합니다.' })
    .default(10),
});

export const createProductSchema = z.object(
  {
    name: z
      .string({ error: '상품명은 필수 값입니다.' })
      .trim()
      .min(1, { error: '상품명은 1자 이상이어야 합니다.' })
      .max(100, { error: '상품명은 100자 이하여야 합니다.' }),

    // 원 단위 정수로 저장한다.
    price: z.coerce
      .number({ error: '가격은 필수 값입니다.' })
      .int({ error: '가격은 정수여야 합니다.' })
      .min(0, { error: '가격은 0 이상이어야 합니다.' })
      .max(100_000_000, { error: '가격은 1억 이하여야 합니다.' }),

    categoryId: z.coerce
      .number({ error: '카테고리는 필수 값입니다.' })
      .int({ error: '올바른 카테고리 ID가 아닙니다.' })
      .positive({ error: '올바른 카테고리 ID가 아닙니다.' }),

    // 업로드 API(POST /images)가 돌려준 주소를 그대로 받는다.
    imageUrl: nullableUrlSchema('올바른 이미지 URL이 아닙니다.').optional(),

    // 관리자가 실제 구매할 외부 판매처 링크
    productUrl: nullableUrlSchema('올바른 상품 URL이 아닙니다.').optional(),
  },
  { error: '요청 본문이 올바르지 않습니다.' },
);

export const updateProductSchema = createProductSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: '수정할 내용이 없습니다.',
  });

export type SearchProductsInput = z.infer<typeof searchProductsSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
