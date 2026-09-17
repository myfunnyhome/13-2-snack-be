import { Router } from 'express';

import * as cartItemController from '../../modules/cartItem/cartItem.controller';

const router = Router();

router.get('/', cartItemController.getCartItems);
router.post('/', cartItemController.addCartItem);
router.patch('/:id', cartItemController.updateCartItem);
router.delete('/:id', cartItemController.removeCartItem);

export default router;
