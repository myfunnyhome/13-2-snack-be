import { Router } from 'express';

import { authenticate } from '../../middlewares/auth.middleware';
import * as meController from '../../modules/me/me.controller';

const router = Router();

router.get('/', authenticate, meController.getMe);

export default router;
