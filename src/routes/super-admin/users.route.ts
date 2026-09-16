import { Router } from 'express';

import { authenticate, authorize } from '../../middlewares/auth.middleware';
import * as userController from '../../modules/user/user.controller';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize('SUPER_ADMIN'),
  userController.getUsers,
);

router.patch(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  userController.changeUserRole,
);

router.delete(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  userController.softDeleteUser,
);

export default router;
