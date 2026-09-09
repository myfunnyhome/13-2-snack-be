import { Router } from 'express';

import { authenticate } from '../../middlewares/auth.middleware';
import * as meController from '../../modules/me/me.controller';

const router = Router();

router.patch('/profile', authenticate, meController.updateProfile);

export default router;
