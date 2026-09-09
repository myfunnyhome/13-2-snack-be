import { Router } from 'express';

import {
  authenticate,
  verifyRefreshToken,
} from '../middlewares/auth.middleware';
import * as authController from '../modules/auth/auth.controller';

const router = Router();

router.post('/auth/signup', authController.signup);
router.post('/auth/signin', authController.signin);
router.post(
  '/auth/refresh-token',
  verifyRefreshToken,
  authController.refreshToken,
);
router.post('/auth/signout', authenticate, authController.signout);

export default router;
