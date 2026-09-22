import { z } from 'zod';

import { PRODUCT_IMAGE_KEY_PREFIX } from './image.constants';

/*
imageKey에 '/'가 들어 있어서 라우트를 /*key 로 받는다.
Express 5는 이 값을 경로 조각 배열로 넘기므로 다시 합친다.
상품 이미지 폴더 밖의 파일은 꺼내거나 지우지 못하게 막는다.
*/
export const imageKeyParamsSchema = z.object({
  key: z
    .array(z.string(), { error: '이미지 경로가 없습니다.' })
    .transform((segments) => segments.join('/'))
    .refine(
      (key) =>
        key.startsWith(PRODUCT_IMAGE_KEY_PREFIX) &&
        !key.split('/').includes('..'),
      { error: '올바른 이미지 경로가 아닙니다.' },
    ),
});
