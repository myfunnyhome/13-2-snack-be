import { Router } from 'express';

import { authenticate } from '../../middlewares/auth.middleware';
import * as userController from '../../modules/user/user.controller';

const router = Router();

router.patch('/', authenticate, userController.updateProfile);

export default router;
