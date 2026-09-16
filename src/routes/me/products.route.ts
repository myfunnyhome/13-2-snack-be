import { Router } from 'express';

import { authenticate } from '../../middlewares/auth.middleware';
import * as productController from '../../modules/product/product.controller';

const router = Router();

// 로그인한 사용자가 등록한 상품 목록. 검색·필터·정렬·페이지 조건은 GET /products와 같다.
router.get('/', authenticate, productController.getMyProducts);

export default router;
