import { Router } from 'express';

import { authenticate } from '../middlewares/auth.middleware';
import * as productController from '../modules/product/product.controller';

const router = Router();

/*
경로 앞부분(/products)은 app.ts에서 app.use('/products', productsRoutes)로 붙인다.
여기에 /products를 또 쓰면 주소가 /products/products가 되므로 뒷부분만 적는다.
상품 등록은 일반 회원도 할 수 있어 authorize를 걸지 않는다.
수정과 삭제는 "등록자 본인 또는 관리자 이상" 규칙이라
등록자를 조회해야 판단할 수 있어 미들웨어가 아닌 service에서 검사한다.
*/
router.get('/', authenticate, productController.getProducts);
router.get('/:id', authenticate, productController.getProduct);
router.post('/', authenticate, productController.createProduct);
router.patch('/:id', authenticate, productController.updateProduct);
router.delete('/:id', authenticate, productController.deleteProduct);

export default router;
