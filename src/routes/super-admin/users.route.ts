import { Router } from 'express';

import { authenticate, authorize } from '../../middlewares/auth.middleware';
import * as userController from '../../modules/user/user.controller';

const router = Router();

router.get(
  '/users',
  authenticate,
  authorize('SUPER_ADMIN'),
  userController.getUsers,
);

router.patch(
  '/users/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  userController.changeUserRole,
);

router.delete(
  '/users/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  userController.softDeleteUser,
);

export default router;
