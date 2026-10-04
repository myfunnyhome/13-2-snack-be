import { Router } from 'express';

import * as orderController from '../../modules/order/order.controller';

const router = Router();

router.get('/', orderController.getMyOrders);
router.get('/:id', orderController.getMyOrderDetail);
router.delete('/:id', orderController.cancelMyOrder);

export default router;
