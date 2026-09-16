import { Router } from 'express';

import invitationsRoutes from './invitations.route';
import usersRoutes from './users.route';

const router = Router();

router.use('/invitations', invitationsRoutes);
router.use('/users', usersRoutes);

export default router;
