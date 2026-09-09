import { Router } from 'express';

import invitationsRoutes from './invitations.route';

const router = Router();

router.use(invitationsRoutes);

export default router;
