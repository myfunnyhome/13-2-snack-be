import { Router } from 'express';

import { Role } from '../../generated/prisma/client';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import ordersRoutes from './orders.route';

const router = Router();

router.use(authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN));

router.use('/orders', ordersRoutes);

export default router;
