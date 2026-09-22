import { Router } from 'express';

import { Role } from '../../generated/prisma/client';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import budgetsRoutes from './budgets.route';
import invitationsRoutes from './invitations.route';
import usersRoutes from './users.route';

const router = Router();

router.use(authenticate, authorize(Role.SUPER_ADMIN));

router.use('/invitations', invitationsRoutes);
router.use('/users', usersRoutes);
router.use('/budgets', budgetsRoutes);

export default router;
