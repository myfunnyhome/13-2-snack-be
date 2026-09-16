import { Router } from 'express';

import { Role } from '../../generated/prisma/client';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import invitationsRoutes from './invitations.route';
import usersRoutes from './users.route';

const router = Router();

router.use(authenticate, authorize(Role.SUPER_ADMIN));

router.use('/invitations', invitationsRoutes);
router.use('/users', usersRoutes);

export default router;
