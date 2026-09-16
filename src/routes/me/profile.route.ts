import { Router } from 'express';

import * as userController from '../../modules/user/user.controller';

const router = Router();

router.patch('/', userController.updateProfile);

export default router;
