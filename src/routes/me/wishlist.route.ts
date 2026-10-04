import { Router } from 'express';

import * as wishlistController from '../../modules/wishlist/wishlist.controller';

const router = Router();

router.get('/', wishlistController.getWishlist);
router.get('/ids', wishlistController.getWishlistIds);
router.post('/:productId', wishlistController.addWishlistItem);
router.delete('/:productId', wishlistController.removeWishlistItem);
router.delete('/', wishlistController.removeWishlistItems);

export default router;
