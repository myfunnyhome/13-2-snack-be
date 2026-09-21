import { Router } from 'express';

import { authenticate } from '../../middlewares/auth.middleware';
import cartItemsRoutes from './cart-items.route';
import ordersRoutes from './orders.route';
import profileRoutes from './profile.route';
import userRoutes from './user.route';

const router = Router();

router.use(authenticate);

router.use('/', userRoutes);
router.use('/profile', profileRoutes);
router.use('/cart-items', cartItemsRoutes);
router.use('/orders', ordersRoutes);

export default router;
