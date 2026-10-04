import { Router } from 'express';

import * as userController from '../../modules/user/user.controller';

const router = Router();

router.get('/', userController.getUsers);

router.patch('/:id', userController.changeUserRole);

router.delete('/:id', userController.softDeleteUser);

export default router;
