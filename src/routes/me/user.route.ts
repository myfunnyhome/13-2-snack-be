import { Router } from 'express';

import * as userController from '../../modules/user/user.controller';

const router = Router();

router.get('/', userController.getMe);

export default router;
