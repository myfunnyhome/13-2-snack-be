import { Router } from 'express';

import invitationsRoutes from './invitations.route';
import usersRoutes from './users.route';

const router = Router();

router.use(invitationsRoutes);
router.use(usersRoutes);

export default router;
