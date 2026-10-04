import { Router } from 'express';

import { authenticate } from '../middlewares/auth.middleware';
import * as productController from '../modules/product/product.controller';

const router = Router();

// 등록은 일반 회원도 가능하고, 수정·삭제 권한은 등록자 조회가 필요해 service에서 검사한다.
router.get('/', authenticate, productController.getProducts);
router.get('/:id', authenticate, productController.getProduct);
router.post('/', authenticate, productController.createProduct);
router.patch('/:id', authenticate, productController.updateProduct);
router.delete('/:id', authenticate, productController.deleteProduct);

export default router;
