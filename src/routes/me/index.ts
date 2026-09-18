import { Router } from 'express';

import { authenticate } from '../../middlewares/auth.middleware';
import ordersRoutes from './orders.route';
import meProductsRoutes from './products.route';
import profileRoutes from './profile.route';
import userRoutes from './user.route';

const router = Router();

router.use(authenticate);

router.use('/', userRoutes);
router.use('/profile', profileRoutes);
router.use('/orders', ordersRoutes);
// 상품 등록 내역. 구현은 modules/product에 있다.
router.use('/products', meProductsRoutes);

export default router;
