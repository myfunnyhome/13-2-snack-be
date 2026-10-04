import { Router } from 'express';

import {
  authenticate,
  verifyRefreshToken,
} from '../middlewares/auth.middleware';
import {
  passwordResetLimiter,
  signinLimiter,
  signupRateLimit,
} from '../middlewares/rateLimiter';
import * as authController from '../modules/auth/auth.controller';

const router = Router();

router.post('/signup', signupRateLimit, authController.signup);
router.post('/signin', signinLimiter, authController.signin);
router.post('/refresh-token', verifyRefreshToken, authController.refreshToken);
router.post('/signout', authenticate, authController.signout);
router.post(
  '/password-reset',
  passwordResetLimiter,
  authController.requestPasswordReset,
);
router.patch('/password-reset', authController.resetPassword);

export default router;
