import { Router } from 'express';

import { authenticate } from '../middlewares/auth.middleware';
import { snackyLimiter } from '../middlewares/rateLimiter';
import * as snackyController from '../modules/snacky/snacky.controller';

const router = Router();

router.post(
  '/answers',
  authenticate,
  snackyLimiter,
  snackyController.askSnacky,
);

export default router;
