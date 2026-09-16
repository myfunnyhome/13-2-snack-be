import { Router } from 'express';

import meProductsRoutes from './products.route';
import profileRoutes from './profile.route';
import userRoutes from './user.route';

const router = Router();

router.use('/', userRoutes);
router.use('/profile', profileRoutes);
// 상품 등록 내역. 구현은 modules/product에 있다.
router.use('/products', meProductsRoutes);

export default router;
