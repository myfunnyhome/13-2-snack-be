import { Router } from 'express';

import { authenticate } from '../../middlewares/auth.middleware';
import cartItemsRoutes from './cart-items.route';
import ordersRoutes from './orders.route';
import meProductsRoutes from './products.route';
import profileRoutes from './profile.route';
import userRoutes from './user.route';
import mewishlistRoutes from './wishlist.route';

const router = Router();

router.use(authenticate);

router.use('/', userRoutes);
router.use('/profile', profileRoutes);
router.use('/cart-items', cartItemsRoutes);
router.use('/orders', ordersRoutes);
<<<<<<< HEAD
router.use('/wishlist', mewishlistRoutes);
=======
// 상품 등록 내역. 구현은 modules/product에 있다.
router.use('/products', meProductsRoutes);
>>>>>>> 0d43ef972e33117e6148e6643898295d77a0438f

export default router;
