import { Router } from 'express';

import * as orderController from '../../modules/order/order.controller';

const router = Router();

router.get('/', orderController.getOrgOrders);
router.get('/:id', orderController.getOrgOrderDetail);
router.patch('/:id/approve', orderController.approveOrder);
router.patch('/:id/reject', orderController.rejectOrder);

export default router;
