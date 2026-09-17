import { Router } from 'express';

import { authenticate } from '../middlewares/auth.middleware';
import * as orderController from '../modules/order/order.controller';

const router = Router();

router.post('/', authenticate, orderController.createOrder);

export default router;
